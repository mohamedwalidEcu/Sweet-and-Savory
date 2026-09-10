const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userAvatar: {
    type: String,
    default: '',
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please provide a rating between 1 and 5'],
  },
  comment: {
    type: String,
    default: '',
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

// Calculate average rating after review is saved or removed
reviewSchema.statics.getAverageRating = async function(productId) {
  try {
    if (mongoose.connection.readyState !== 1) return;
    const stats = await this.aggregate([
      { $match: { product: productId } },
      {
        $group: {
          _id: '$product',
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].reviewCount
      });
    } else {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        rating: 4.8,
        reviewCount: 0
      });
    }
  } catch (err) {
    if (mongoose.connection.readyState === 1) {
      console.error('Error updating product rating average:', err);
    }
  }
};

reviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.product);
});

reviewSchema.post('remove', function() {
  this.constructor.getAverageRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
