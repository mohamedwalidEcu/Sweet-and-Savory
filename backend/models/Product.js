const mongoose = require('mongoose');

const sizeOptionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. 'Personal (8")', 'Medium (12")', 'Large (16")', or 'Single', 'Box of 6', 'Box of 12'
  priceAdjustment: { type: Number, default: 0 },
  isDefault: { type: Boolean, default: false }
}, { _id: false });

const customizationOptionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. 'Extra Mozzarella', 'Hot Honey Drizzle', 'Chocolate Glaze'
  price: { type: Number, default: 0 },
  category: { type: String, default: 'general' }
}, { _id: false });

const nutritionalInfoSchema = new mongoose.Schema({
  calories: { type: Number, default: 0 },
  protein: { type: String, default: '' },
  carbs: { type: String, default: '' },
  fat: { type: String, default: '' }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters'],
  },
  nameAr: {
    type: String,
    default: '',
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
  },
  descriptionAr: {
    type: String,
    default: '',
    trim: true,
  },
  shortDescription: {
    type: String,
    default: '',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please specify a category'],
    index: true,
  },
  categorySlug: {
    type: String,
    required: true,
    index: true,
  },
  images: [{
    type: String,
    required: true,
  }],
  price: {
    type: Number,
    required: [true, 'Please specify base price'],
    min: [0, 'Price must be positive'],
  },
  discountPrice: {
    type: Number,
    default: null,
  },
  rating: {
    type: Number,
    default: 4.8,
    min: 0,
    max: 5,
    index: true,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    required: [true, 'Please specify stock quantity'],
    default: 50,
  },
  availableSizes: [sizeOptionSchema],
  availableToppings: [customizationOptionSchema],
  availableFlavors: [customizationOptionSchema],
  ingredients: [{
    type: String,
    trim: true,
  }],
  nutritionalInfo: {
    type: nutritionalInfoSchema,
    default: () => ({})
  },
  preparationTime: {
    type: String,
    default: '15-25 min',
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
  badgeText: {
    type: String,
    default: '', // e.g. "Chef's Special", "Best Seller", "20% OFF"
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Text index for full-text search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
