// server.js
// The main entry point for the Express backend.
// Connects to MongoDB, sets up middleware, and mounts all API routes.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); // Always load .env from backend/
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import route handlers
const authRoutes    = require('./routes/auth');
const schoolRoutes  = require('./routes/schools');
const productRoutes = require('./routes/products');
const orderRoutes   = require('./routes/orders');
const aiRoutes      = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to Database ───────────────────────────────────────────────────────
connectDB();

// ─── Middleware ────────────────────────────────────────────────────────────────

// Allow requests from the frontend (CORS = Cross-Origin Resource Sharing)
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Parse incoming JSON request bodies
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/schools',  schoolRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/ai',       aiRoutes);

// Health check — useful for deployment platforms like Render
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ShopMyUniform API is running' });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
// Catches any errors that weren't handled in individual routes
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Something went wrong on the server.' });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
