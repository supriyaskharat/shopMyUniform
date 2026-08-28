// middleware/auth.js
// Protects routes by verifying the JWT token sent in the request header.
// Usage: add `protect` as middleware to any route that requires login.

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  // Step 1: Get the token from the Authorization header
  // Expected format: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Step 2: Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 3: Attach the user's info to the request object so routes can use it
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    next(); // Token is valid, proceed to the route handler
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
  }
};

module.exports = { protect };
