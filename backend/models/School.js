// models/School.js
// Represents a school that sells uniforms through ShopMyUniform.
// Each school has a list of grades it supports.

const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'School name is required'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  // e.g. ['1', '2', '3', ..., '12']
  grades: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model('School', schoolSchema);
