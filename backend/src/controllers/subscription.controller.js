import Subscription from '../models/Subscription.model.js';
import Plan from '../models/Plan.model.js';
import Payment from '../models/Payment.model.js';
import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';
import stripe from '../config/stripe.config.js';

// @desc    Get user subscriptions
// @route   GET /api/subscriptions
// @access  Private
export const getSubscriptions = async (req, res, next) => {
  try {
    const query = req.user.role === 'super_admin' ? {} : { user: req.user._id };
    
    const subscriptions = await Subscription.find(query)
      .populate('user', 'name email')
      .populate('plan')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subscription
// @route   GET /api/subscriptions/:id
// @access  Private
export const getSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('user', 'name email')
      .populate('plan');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'super_admin' && subscription.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this subscription'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create subscription (handled via Stripe checkout)
// @route   POST /api/subscriptions
// @access  Private
export const createSubscription = async (req, res, next) => {
  try {
    const { planId, billingCycle } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found or inactive'
      });
    }

    // Cancel existing active subscription
    await Subscription.updateMany(
      { user: req.user._id, status: 'active' },
      { status: 'canceled', canceledAt: new Date() }
    );

    // Get Stripe price ID
    const stripePriceId = billingCycle === 'monthly' 
      ? plan.stripePriceIdMonthly 
      : plan.stripePriceIdYearly;

    if (!stripePriceId) {
      return res.status(400).json({
        success: false,
        message: 'Stripe price not configured for this plan'
      });
    }

    // Create Stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: req.user.stripeCustomerId,
      items: [{ price: stripePriceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: plan.trialDays || 0
    });

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    const trialEndDate = plan.trialDays > 0 
      ? new Date(startDate.getTime() + plan.trialDays * 24 * 60 * 60 * 1000)
      : null;
    
    if (billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Save subscription to database
    const newSubscription = await Subscription.create({
      user: req.user._id,
      plan: planId,
      billingCycle,
      status: subscription.status === 'trialing' ? 'trialing' : 'active',
      startDate,
      endDate,
      trialEndDate,
      nextBillingDate: endDate,
      stripeSubscriptionId: subscription.id,
      stripePriceId
    });

    res.status(201).json({
      success: true,
      data: newSubscription,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel subscription
// @route   POST /api/subscriptions/:id/cancel
// @access  Private
export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'super_admin' && subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this subscription'
      });
    }

    // Cancel in Stripe
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
    }

    // Update subscription
    subscription.cancelAtPeriodEnd = true;
    subscription.canceledAt = new Date();
    await subscription.save();

    // Create notification
    await Notification.create({
      user: subscription.user,
      type: 'subscription_cancelled',
      title: 'Subscription Cancelled',
      message: `Your subscription will cancel at the end of the current billing period.`
    });

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upgrade subscription
// @route   POST /api/subscriptions/:id/upgrade
// @access  Private
export const upgradeSubscription = async (req, res, next) => {
  try {
    const { newPlanId } = req.body;
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const newPlan = await Plan.findById(newPlanId);
    if (!newPlan || !newPlan.isActive) {
      return res.status(404).json({
        success: false,
        message: 'New plan not found'
      });
    }

    // Update subscription in Stripe
    if (subscription.stripeSubscriptionId) {
      const stripePriceId = subscription.billingCycle === 'monthly'
        ? newPlan.stripePriceIdMonthly
        : newPlan.stripePriceIdYearly;

      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        items: [{
          id: subscription.stripeSubscriptionId,
          price: stripePriceId
        }],
        proration_behavior: 'create_prorations'
      });
    }

    // Update in database
    subscription.plan = newPlanId;
    subscription.stripePriceId = subscription.billingCycle === 'monthly'
      ? newPlan.stripePriceIdMonthly
      : newPlan.stripePriceIdYearly;
    await subscription.save();

    // Create notification
    await Notification.create({
      user: subscription.user,
      type: 'plan_changed',
      title: 'Plan Upgraded',
      message: `Your subscription has been upgraded to ${newPlan.name}.`
    });

    res.json({
      success: true,
      message: 'Subscription upgraded successfully',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};
