import stripe from '../config/stripe.config.js';
import Plan from '../models/Plan.model.js';
import User from '../models/User.model.js';
import Payment from '../models/Payment.model.js';
import Subscription from '../models/Subscription.model.js';
import Notification from '../models/Notification.model.js';
import Coupon from '../models/Coupon.model.js';

// @desc    Create checkout session
// @route   POST /api/payments/create-checkout
// @access  Private
export const createCheckoutSession = async (req, res, next) => {
  try {
    const { planId, billingCycle, manualMethod, transactionId, couponCode, cardDetails } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Process Coupon if provided
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true
      });

      if (coupon) {
        // Simple validity check
        const now = new Date();
        if (now >= coupon.validFrom && now <= coupon.validUntil &&
          (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {

          const amount = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
          if (amount >= coupon.minAmount) {
            if (coupon.discountType === 'percentage') {
              discount = (amount * coupon.discountValue) / 100;
              if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
            } else {
              discount = coupon.discountValue;
            }
            appliedCoupon = coupon.code;

            // Increment coupon usage
            coupon.usedCount += 1;
            await coupon.save();
          }
        }
      }
    }

    const stripePriceId = billingCycle === 'monthly'
      ? plan.stripePriceIdMonthly
      : plan.stripePriceIdYearly;

    // If Stripe is not configured or price ID missing, create manual subscription
    if (!stripe || !stripePriceId) {
      // Cancel existing subscriptions
      await Subscription.updateMany(
        { user: req.user._id, status: 'active' },
        { status: 'canceled', canceledAt: new Date() }
      );

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

      // Create subscription
      const newSubscription = await Subscription.create({
        user: req.user._id,
        plan: planId,
        billingCycle,
        status: plan.trialDays > 0 ? 'trialing' : 'active',
        startDate,
        endDate,
        trialEndDate,
        nextBillingDate: endDate
      });

      // Create payment record
      const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
      const finalAmount = Math.max(0, price - discount);

      await Payment.create({
        user: req.user._id,
        subscription: newSubscription._id,
        amount: finalAmount, // Record the actual amount intended/paid
        currency: 'usd',
        status: 'pending',
        paymentMethod: 'manual',
        manualPaymentMethod: manualMethod || 'none',
        transactionId: transactionId || (manualMethod === 'card' ? `CARD-${Date.now()}` : ''),
        discount: discount,
        appliedCoupon: appliedCoupon
      });

      // Create notification for Admin (optional but good)
      // For now just for user
      await Notification.create({
        user: req.user._id,
        type: 'payment_pending',
        title: 'Payment Pending Verification',
        message: `Your manual payment via ${manualMethod || 'Manual'} is being verified. Your subscription will activate soon.`
      });

      return res.json({
        success: true,
        data: {
          subscription: newSubscription,
          message: plan.trialDays > 0
            ? `Subscription started with ${plan.trialDays} days free trial!`
            : 'Subscription activated successfully!'
        }
      });
    }

    // Ensure user has Stripe customer ID
    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          userId: req.user._id.toString()
        }
      });
      customerId = customer.id;
      req.user.stripeCustomerId = customerId;
      await req.user.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      allow_promotion_codes: true,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
      metadata: {
        userId: req.user._id.toString(),
        planId: planId.toString(),
        billingCycle
      },
      subscription_data: {
        trial_period_days: plan.trialDays || 0,
        metadata: {
          userId: req.user._id.toString(),
          planId: planId.toString()
        }
      }
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history
// @route   GET /api/payments
// @access  Private
export const getPayments = async (req, res, next) => {
  try {
    const query = req.user.role === 'super_admin' ? {} : { user: req.user._id };

    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate({
        path: 'subscription',
        populate: {
          path: 'plan',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
export const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email')
      .populate('subscription');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'super_admin' && payment.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this payment'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve manual payment
// @route   POST /api/payments/:id/approve
// @access  Private (Admin)
export const approvePayment = async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admins can approve payments'
      });
    }

    const payment = await Payment.findById(req.params.id).populate('subscription');
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment is already processed'
      });
    }

    // Update payment status
    payment.status = 'succeeded';
    await payment.save();

    // Activate subscription
    if (payment.subscription) {
      const subscription = await Subscription.findById(payment.subscription._id);
      subscription.status = 'active';
      await subscription.save();

      // Create notification for user
      await Notification.create({
        user: payment.user,
        type: 'payment_success',
        title: 'Payment Approved',
        message: `Your manual payment has been verified. Your subscription is now active.`
      });
    }

    res.json({
      success: true,
      message: 'Payment approved successfully',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Card Information
// @route   POST /api/payments/verify-card
// @access  Private
export const verifyCard = async (req, res, next) => {
  try {
    const { cardNumber, expiry, cvc, name } = req.body;

    // Basic simulation of card validation
    if (!cardNumber || !expiry || !cvc || !name) {
      return res.status(400).json({
        success: false,
        message: 'All card details are required'
      });
    }

    // Simulate server-side verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple pattern check for simulation
    const isMockValid = cardNumber.replace(/\s/g, '').length >= 15;

    if (!isMockValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid card number or details'
      });
    }

    res.json({
      success: true,
      message: 'Card verified successfully'
    });
  } catch (error) {
    next(error);
  }
};


