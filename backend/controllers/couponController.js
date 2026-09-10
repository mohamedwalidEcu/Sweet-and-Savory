const Coupon = require('../models/Coupon');
const { successResponse } = require('../utils/apiResponse');
const AppError = require('../utils/appError');

const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code) {
      throw new AppError('Coupon code is required', 400);
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    });

    if (!coupon) {
      throw new AppError('Invalid coupon code', 404);
    }

    if (new Date() > new Date(coupon.expirationDate)) {
      throw new AppError('Coupon has expired', 400);
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new AppError('Coupon usage limit reached', 400);
    }

    if (subtotal < coupon.minOrder) {
      throw new AppError(`Minimum order amount of $${coupon.minOrder.toFixed(2)} required for this coupon`, 400);
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.value, subtotal);
    }

    return successResponse(res, 200, 'Coupon applied successfully', {
      code: coupon.code,
      discountAmount: Number(discountAmount.toFixed(2)),
      type: coupon.type,
      value: coupon.value,
      description: coupon.description,
    });
  } catch (error) {
    next(error);
  }
};

const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return successResponse(res, 200, 'Coupons retrieved', coupons);
  } catch (error) {
    next(error);
  }
};

const getPublicOffers = async (req, res, next) => {
  try {
    const activeOffers = await Coupon.find({
      isActive: true,
      expirationDate: { $gt: new Date() }
    }).select('code description type value minOrder');
    return successResponse(res, 200, 'Active offers retrieved', activeOffers);
  } catch (error) {
    next(error);
  }
};

const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create({
      ...req.body,
      code: req.body.code.toUpperCase().trim(),
    });
    return successResponse(res, 201, 'Coupon created', coupon);
  } catch (error) {
    next(error);
  }
};

const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }
    return successResponse(res, 200, 'Coupon updated', coupon);
  } catch (error) {
    next(error);
  }
};

const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }
    return successResponse(res, 200, 'Coupon deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCoupon,
  getCoupons,
  getPublicOffers,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
