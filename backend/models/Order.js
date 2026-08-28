// models/Order.js
// Represents a customer's purchase order.
// Automatically generates a unique order number before saving.

const mongoose = require('mongoose');

// Schema for each item inside an order
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  name: String,      // Store name at time of purchase (in case product is deleted later)
  size: String,
  quantity: {
    type: Number,
    default: 1,
  },
  price: Number,     // Store price at time of purchase
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Human-readable order number, e.g. "ORD-20240829-00001"
  orderNumber: {
    type: String,
    unique: true,
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'placed',
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
  },
  // Expected delivery date (set to 7 days from order placement)
  estimatedDelivery: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate a unique order number before saving
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 90000) + 10000; // 5-digit random number
    this.orderNumber = `ORD-${date}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
