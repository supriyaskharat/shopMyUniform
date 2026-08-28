// config/db.js
// Connects to MongoDB using the URI from environment variables.
// Call connectDB() once when the server starts.

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    // Exit process if we can't connect to the database
    process.exit(1);
  }
};

module.exports = connectDB;
