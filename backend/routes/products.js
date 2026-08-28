// routes/products.js
// Returns uniform products with support for filtering and search.
// Supports query params: school, grade, category, gender, search, minPrice, maxPrice

const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// GET /api/products — List products with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { school, grade, category, gender, search, minPrice, maxPrice } = req.query;

    // Build the filter object dynamically based on what was provided
    const filter = {};

    if (school)    filter.school = String(school);
    if (category)  filter.category = String(category);
    if (gender)    filter.gender = String(gender);

    // grades is an array field — check if the grade value is in the array
    if (grade)     filter.grades = String(grade);

    // Case-insensitive text search on the product name
    if (search)    filter.name = { $regex: String(search), $options: 'i' };

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter)
      .populate('school', 'name city')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id — Get a single product's full details
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('school', 'name city');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
