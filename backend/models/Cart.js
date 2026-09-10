const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
  selectedSize: {
    name: { type: String, default: 'Regular' },
    priceAdjustment: { type: Number, default: 0 },
  },
  selectedToppings: [{
    name: { type: String },
    price: { type: Number, default: 0 },
  }],
  selectedFlavors: [{
    name: { type: String },
    price: { type: Number, default: 0 },
  }],
  unitPrice: {
    type: Number,
    required: true,
  },
  itemTotal: {
    type: Number,
    required: true,
  },
  specialInstructions: {
    type: String,
    default: '',
    maxlength: 300,
  }
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

// Calculate subtotal before save
cartSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((sum, item) => sum + item.itemTotal, 0);
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
