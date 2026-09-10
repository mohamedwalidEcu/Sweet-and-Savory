const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  selectedSize: {
    name: { type: String, default: 'Regular' },
    priceAdjustment: { type: Number, default: 0 }
  },
  selectedToppings: [{
    name: { type: String },
    price: { type: Number, default: 0 }
  }],
  selectedFlavors: [{
    name: { type: String },
    price: { type: Number, default: 0 }
  }],
  unitPrice: { type: Number, required: true },
  itemTotal: { type: Number, required: true },
  specialInstructions: { type: String, default: '' }
}, { _id: false });

const orderStatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    required: true,
  },
  note: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    deliveryNotes: { type: String, default: '' }
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ['simulated_card', 'cash_on_delivery', 'stripe_ready'],
      default: 'simulated_card'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed'
    },
    transactionId: { type: String, default: () => `TX-${Date.now()}-${Math.floor(Math.random()*10000)}` },
    cardLast4: { type: String, default: '4242' }
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
    index: true,
  },
  statusHistory: [orderStatusHistorySchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 3.50 },
  total: { type: Number, required: true },
  appliedCoupon: {
    code: { type: String },
    discountValue: { type: Number }
  },
  estimatedDeliveryTime: {
    type: String,
    default: '30-45 minutes'
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
