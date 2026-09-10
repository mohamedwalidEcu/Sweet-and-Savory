const Wishlist = require('../models/Wishlist');
const { successResponse } = require('../utils/apiResponse');
const AppError = require('../utils/appError');

const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate({
      path: 'products',
      populate: { path: 'category', select: 'name slug' }
    });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }
    return successResponse(res, 200, 'Wishlist retrieved', wishlist);
  } catch (error) {
    next(error);
  }
};

const toggleWishlist = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      throw new AppError('حسابات الإدارة لا يمكنها استخدام قائمة المفضلة / Admins cannot use wishlist', 403);
    }

    const { productId } = req.body;
    if (!productId) {
      throw new AppError('Product ID is required', 400);
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, products: [] });
    }

    const index = wishlist.products.indexOf(productId);
    let action = '';

    if (index > -1) {
      wishlist.products.splice(index, 1);
      action = 'removed';
    } else {
      wishlist.products.push(productId);
      action = 'added';
    }

    await wishlist.save();
    const updatedWishlist = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      populate: { path: 'category', select: 'name slug' }
    });

    return successResponse(res, 200, `Product ${action} from wishlist`, {
      wishlist: updatedWishlist,
      action,
      productId,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
};
