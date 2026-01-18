import Subscription from '../models/Subscription.model.js';
import Payment from '../models/Payment.model.js';
import Plan from '../models/Plan.model.js';
import User from '../models/User.model.js';
import Notification from '../models/Notification.model.js';
import stripe from '../config/stripe.config.js';

export const handleStripeWebhook = async (event) => {
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  } catch (error) {
    console.error('Webhook handler error:', error);
    throw error;
  }
};

// Handle checkout session completed
async function handleCheckoutSessionCompleted(session) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;
  const billingCycle = session.metadata?.billingCycle;

  if (!userId || !planId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  const user = await User.findById(userId);
  const plan = await Plan.findById(planId);

  if (!user || !plan) {
    console.error('User or plan not found');
    return;
  }

  // Get subscription from Stripe
  const subscriptionId = session.subscription;
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Cancel existing subscriptions
  await Subscription.updateMany(
    { user: userId, status: 'active' },
    { status: 'canceled', canceledAt: new Date() }
  );

  // Calculate dates
  const startDate = new Date(stripeSubscription.current_period_start * 1000);
  const endDate = new Date(stripeSubscription.current_period_end * 1000);
  const trialEndDate = stripeSubscription.trial_end
    ? new Date(stripeSubscription.trial_end * 1000)
    : null;

  // Create subscription
  const subscription = await Subscription.create({
    user: userId,
    plan: planId,
    billingCycle,
    status: stripeSubscription.status === 'trialing' ? 'trialing' : 'active',
    startDate,
    endDate,
    trialEndDate,
    nextBillingDate: endDate,
    stripeSubscriptionId: subscriptionId,
    stripePriceId: stripeSubscription.items.data[0].price.id
  });

  // Create notification
  await Notification.create({
    user: userId,
    type: 'payment_success',
    title: 'Subscription Activated',
    message: `Your subscription to ${plan.name} has been activated.`
  });

  console.log(`Subscription created: ${subscription._id}`);
}

// Handle subscription updated
async function handleSubscriptionUpdated(stripeSubscription) {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id
  });

  if (!subscription) {
    console.error(`Subscription not found: ${stripeSubscription.id}`);
    return;
  }

  // Update subscription status
  subscription.status = stripeSubscription.status === 'trialing' 
    ? 'trialing' 
    : stripeSubscription.status === 'active'
    ? 'active'
    : subscription.status;

  subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
  
  if (stripeSubscription.current_period_end) {
    subscription.endDate = new Date(stripeSubscription.current_period_end * 1000);
    subscription.nextBillingDate = new Date(stripeSubscription.current_period_end * 1000);
  }

  if (stripeSubscription.canceled_at) {
    subscription.canceledAt = new Date(stripeSubscription.canceled_at * 1000);
    subscription.status = 'canceled';
  }

  await subscription.save();
}

// Handle subscription deleted
async function handleSubscriptionDeleted(stripeSubscription) {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id
  });

  if (subscription) {
    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    await subscription.save();

    // Create notification
    await Notification.create({
      user: subscription.user,
      type: 'subscription_cancelled',
      title: 'Subscription Cancelled',
      message: 'Your subscription has been cancelled.'
    });
  }
}

// Handle invoice payment succeeded
async function handleInvoicePaymentSucceeded(invoice) {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: invoice.subscription
  });

  if (!subscription) {
    console.error(`Subscription not found for invoice: ${invoice.id}`);
    return;
  }

  // Create or update payment record
  await Payment.findOneAndUpdate(
    { stripeInvoiceId: invoice.id },
    {
      user: subscription.user,
      subscription: subscription._id,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency,
      status: 'succeeded',
      stripePaymentIntentId: invoice.payment_intent,
      stripeInvoiceId: invoice.id,
      billingPeriodStart: new Date(invoice.period_start * 1000),
      billingPeriodEnd: new Date(invoice.period_end * 1000),
      invoiceUrl: invoice.hosted_invoice_url
    },
    { upsert: true, new: true }
  );

  // Update subscription next billing date
  if (invoice.period_end) {
    subscription.nextBillingDate = new Date(invoice.period_end * 1000);
    subscription.endDate = new Date(invoice.period_end * 1000);
    await subscription.save();
  }

  // Create notification
  await Notification.create({
    user: subscription.user,
    type: 'payment_success',
    title: 'Payment Successful',
    message: `Your payment of $${(invoice.amount_paid / 100).toFixed(2)} has been processed successfully.`
  });
}

// Handle invoice payment failed
async function handleInvoicePaymentFailed(invoice) {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: invoice.subscription
  });

  if (!subscription) {
    return;
  }

  // Update subscription status
  subscription.status = 'past_due';
  await subscription.save();

  // Create payment record
  await Payment.create({
    user: subscription.user,
    subscription: subscription._id,
    amount: invoice.amount_due / 100,
    currency: invoice.currency,
    status: 'failed',
    stripeInvoiceId: invoice.id,
    invoiceUrl: invoice.hosted_invoice_url
  });

  // Create notification
  await Notification.create({
    user: subscription.user,
    type: 'payment_failed',
    title: 'Payment Failed',
    message: `Your payment of $${(invoice.amount_due / 100).toFixed(2)} failed. Please update your payment method.`
  });
}
