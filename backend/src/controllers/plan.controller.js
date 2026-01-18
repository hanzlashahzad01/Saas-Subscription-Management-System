import Plan from '../models/Plan.model.js';
import stripe from '../config/stripe.config.js';

// @desc    Get all plans
// @route   GET /api/plans
// @access  Public
export const getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single plan
// @route   GET /api/plans/:id
// @access  Public
export const getPlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id).populate('createdBy', 'name email');

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create plan
// @route   POST /api/plans
// @access  Private (Admin)
export const createPlan = async (req, res, next) => {
  try {
    const { name, description, price, features, usageLimits, trialDays } = req.body;

    // Create Stripe prices (optional - only if Stripe is configured)
    let stripePriceIdMonthly = null;
    let stripePriceIdYearly = null;

    if (stripe) {
      try {
        if (price.monthly) {
          const monthlyPrice = await stripe.prices.create({
            unit_amount: Math.round(price.monthly * 100), // Convert to cents
            currency: 'usd',
            recurring: { interval: 'month' },
            product_data: {
              name: `${name} - Monthly`
            }
          });
          stripePriceIdMonthly = monthlyPrice.id;
        }

        if (price.yearly) {
          const yearlyPrice = await stripe.prices.create({
            unit_amount: Math.round(price.yearly * 100), // Convert to cents
            currency: 'usd',
            recurring: { interval: 'year' },
            product_data: {
              name: `${name} - Yearly`
            }
          });
          stripePriceIdYearly = yearlyPrice.id;
        }
      } catch (stripeError) {
        console.error('Stripe price creation error:', stripeError);
        console.warn('⚠️ Continuing without Stripe prices. Plan will be created but payment integration will not work.');
        // Continue without Stripe - plan can still be created
        // Stripe prices will be null and can be added later
      }
    } else {
      console.warn('⚠️ Stripe not configured. Plan will be created without Stripe price IDs.');
    }

    const plan = await Plan.create({
      name,
      description,
      price,
      features: features || [],
      usageLimits: usageLimits || {},
      trialDays: trialDays || 0,
      stripePriceIdMonthly,
      stripePriceIdYearly,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update plan
// @route   PUT /api/plans/:id
// @access  Private (Admin)
export const updatePlan = async (req, res, next) => {
  try {
    let plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    plan = await Plan.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete plan
// @route   DELETE /api/plans/:id
// @access  Private (Admin)
export const deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Soft delete - just mark as inactive
    plan.isActive = false;
    await plan.save();

    res.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
