// routes/orders.js
// Handles creating orders and fetching order history for the logged-in user.
// All routes are protected — a valid JWT token is required.

const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

const DELIVERY_DAYS = 7; // Estimated delivery in 7 days from order placement

// GET /api/orders — Get all orders placed by the logged-in user
router.get('/', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name category')
      .sort({ createdAt: -1 }); // Newest orders first

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
});

// POST /api/orders — Place a new order
// Body: { items: [{ productId, size, quantity }], shippingAddress: {...} }
router.post('/', protect, async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item.' });
    }

    // Fetch product prices from DB to prevent price tampering from the frontend
    const orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error(`Product ${item.productId} not found.`);
        return {
          product: product._id,
          name: product.name,    // Store name at time of purchase
          size: item.size,
          quantity: item.quantity,
          price: product.price,  // Use DB price, not client-sent price
        };
      })
    );

    // Calculate total from actual DB prices
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Set estimated delivery date
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + DELIVERY_DAYS);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      estimatedDelivery,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id — Get a single order's details (must belong to logged-in user)
router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id, // Security: ensure the order belongs to this user
    }).populate('items.product', 'name category color');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
