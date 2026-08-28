// models/Product.js
// Represents a uniform item available for purchase.
// Products are linked to a specific school and applicable grades.

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  // Category helps with filtering and the AI agent's product lookup
  category: {
    type: String,
    required: true,
    enum: ['shirt', 'trouser', 'skirt', 'blazer', 'tie', 'shoes', 'shorts', 'pinafore'],
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  gender: {
    type: String,
    enum: ['boys', 'girls', 'unisex'],
    required: true,
  },
  // Which grades this product applies to, e.g. ['6', '7', '8']
  grades: {
    type: [String],
    default: [],
  },
  // Available sizes, e.g. ['XS', 'S', 'M', 'L', 'XL'] or ['28', '30', '32'] for trousers
  sizes: {
    type: [String],
    default: [],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
  },
  stock: {
    type: Number,
    default: 100,
  },
  color: {
    type: String,
    default: 'white',
  },
  description: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
