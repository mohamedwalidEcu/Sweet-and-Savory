const Review = require('../models/Review');
const Product = require('../models/Product');
const { successResponse } = require('../utils/apiResponse');
const AppError = require('../utils/appError');

const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });
    return successResponse(res, 200, 'Reviews retrieved', reviews);
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      throw new AppError('حسابات إدارة النظام مخصصة للإشراف فقط ولا يمكنها كتابة تقييمات للعملاء / Admins cannot post reviews', 403);
    }

    const { productId } = req.params;
    const { rating, comment } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      throw new AppError('يرجى اختيار تقييم صحيح بين 1 و 5 نجوم / Please provide a rating (1-5)', 400);
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const commentText = (comment && comment.trim()) ? comment.trim() : (numRating >= 4 ? 'تقييم ممتاز وطعام رائع!' : 'تقييم العميل');

    // Check if user already reviewed this product -> Update existing review
    let review = await Review.findOne({ user: req.user.id, product: productId });
    if (review) {
      review.rating = numRating;
      review.comment = commentText;
      review.userName = req.user.name || review.userName;
      review.userAvatar = req.user.avatar || review.userAvatar;
      await review.save();
      return successResponse(res, 200, 'Review updated successfully', review);
    }

    review = await Review.create({
      user: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar || '',
      product: productId,
      rating: numRating,
      comment: commentText,
      isVerifiedPurchase: true,
    });

    return successResponse(res, 201, 'Review submitted successfully', review);
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Not authorized to delete this review', 403);
    }

    const productId = review.product;
    await review.deleteOne();
    await Review.getAverageRating(productId);

    return successResponse(res, 200, 'Review removed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  createReview,
  deleteReview,
};
