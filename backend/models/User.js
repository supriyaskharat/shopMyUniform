// models/User.js
// Defines the User schema for students and parents.
// Automatically hashes passwords before saving, and provides a method to check passwords.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['student', 'parent'],
    default: 'student',
  },
  // Which school the student/parent belongs to
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    default: null,
  },
  grade: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Before saving, hash the password if it was changed
userSchema.pre('save', async function (next) {
  // Only hash if the password field was actually modified
  if (!this.isModified('password')) return next();

  const SALT_ROUNDS = 10;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

// Method to compare a plain-text password with the stored hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
