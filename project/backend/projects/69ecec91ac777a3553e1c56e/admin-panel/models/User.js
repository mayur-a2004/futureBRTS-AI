/*
This file defines the user model for the admin panel.
It uses Mongoose for schema definition and adheres to the strict prototype rule
and symbol contract provided.
*/

const mongoose = require('mongoose');
const { User } = require('../models/User'); // Import User model
const { Order } = require('../models/Order'); // Import Order model
const { AuthenticationModel } = require('../models/Auth'); // Import Auth model
const { Product } = require('../models/Product'); // Import Product model

// Define the Admin User Schema
const AdminUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Basic email validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // Minimum password length
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String // URL or path to the profile picture
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  location: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin'
  }
});

// Pre-save hook to hash the password (if needed - Auth model handles this)
// AdminUserSchema.pre('save', async function(next) {
//   if (this.isModified('password')) {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//   }
//   next();
// });

// Define the Admin User Model
const AdminUser = mongoose.model('AdminUser', AdminUserSchema);

// Export the Admin User Model
module.exports = AdminUser;