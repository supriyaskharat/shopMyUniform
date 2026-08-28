// routes/auth.js
// Handles user registration, login, and profile management.
// Public routes: /register, /login
// Protected routes: /me (requires JWT token)

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const JWT_EXPIRES_IN = '7d';

// Helper: create a JWT token for a given user ID
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Helper: return user data without the password field
const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  school: user.school,
  grade: user.grade,
});

// POST /api/auth/register — Create a new user account
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Create the user (password is hashed automatically by the User model's pre-save hook)
    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id);

    res.status(201).json({ success: true, data: { token, user: sanitizeUser(user) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login — Log in with email and password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email (include password field for comparison)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check if the provided password matches the stored hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);
    res.json({ success: true, data: { token, user: sanitizeUser(user) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me — Get the currently logged-in user's profile
router.get('/me', protect, async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id).populate('school', 'name city grades');
    res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/auth/me — Update the current user's name, school, and grade
router.put('/me', protect, async (req, res) => {
  try {
    const { name, school, grade } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, school, grade },
      { new: true, runValidators: true } // Return the updated document
    ).populate('school', 'name city grades');

    res.json({ success: true, data: sanitizeUser(updatedUser) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
