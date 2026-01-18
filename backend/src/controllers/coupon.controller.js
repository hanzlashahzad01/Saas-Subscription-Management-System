import Coupon from '../models/Coupon.model.js';

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private (Admin)
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find()
      .populate('createdBy', 'name email')
      .populate('applicablePlans', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: coupons.length,
      data: coupons
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single coupon by code
// @route   GET /api/coupons/validate/:code
// @access  Public
export const validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { planId, amount } = req.query;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true
    }).populate('applicablePlans');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Check validity dates
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired or not yet valid'
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit reached'
      });
    }

    // Check if applicable to plan
    if (coupon.applicablePlans.length > 0 && planId) {
      const planIds = coupon.applicablePlans.map(p => p._id.toString());
      if (!planIds.includes(planId)) {
        return res.status(400).json({
          success: false,
          message: 'Coupon not applicable to this plan'
        });
      }
    }

    // Check minimum amount
    if (amount && parseFloat(amount) < coupon.minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount of $${coupon.minAmount} required`
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (parseFloat(amount) * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      success: true,
      data: {
        coupon: {
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discount: Math.round(discount * 100) / 100,
          maxDiscount: coupon.maxDiscount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Private (Admin)
export const createCoupon = async (req, res, next) => {
  try {
    const couponData = {
      ...req.body,
      code: req.body.code.toUpperCase(),
      createdBy: req.user._id
    };

    const coupon = await Coupon.create(couponData);

    res.status(201).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private (Admin)
export const updateCoupon = async (req, res, next) => {
  try {
    let coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }

    coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Admin)
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Soft delete
    coupon.isActive = false;
    await coupon.save();

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon (increment usage)
// @route   POST /api/coupons/:code/apply
// @access  Private
export const applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.params;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    coupon.usedCount += 1;
    await coupon.save();

    res.json({
      success: true,
      message: 'Coupon applied successfully'
    });
  } catch (error) {
    next(error);
  }
};
