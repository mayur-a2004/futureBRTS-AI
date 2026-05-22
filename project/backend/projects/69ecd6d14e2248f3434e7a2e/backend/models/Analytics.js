/*
// Analytics Model Definition

// This model tracks user interactions with products, orders, and other key events.
// It's designed to provide data for analytics dashboards and reporting.

// Fields:
// - eventType: String (e.g., 'product_view', 'add_to_cart', 'purchase', 'order_placed', 'payment_success')
// - userId: Number (Reference to User.id, can be null for anonymous users)
// - productId: Number (Reference to Product.id, can be null if not product-related)
// - orderId: Number (Reference to Order.id, can be null if not order-related)
// - timestamp: Date (Timestamp of the event)
// - eventData: Object (JSON object to store additional event-specific data)
// - sessionId: String (Unique session identifier for the user)
// - ipAddress: String (User's IP address)
// - userAgent: String (User's browser/device information)
// - pageUrl: String (URL of the page where the event occurred)
// - referralUrl: String (URL of the referring page)

// UI PROTOTYPE MODE: DB PRESERVED AS DOCUMENTATION

const mongoose = require('mongoose');
const { db } = require('../config/db');
const { User } = require('../models/User');
const { Product } = require('../models/Product');
const { Order } = require('../models/Order');
const { OrderItem } = require('../models/OrderItem');
const { Payment } = require('../models/Payment');

const analyticsSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['product_view', 'add_to_cart', 'purchase', 'order_placed', 'payment_success', 'product_added', 'product_updated', 'product_deleted', 'user_login', 'user_signup', 'other']
  },
  userId: {
    type: Number,
    ref: 'User',
    default: null
  },
  productId: {
    type: Number,
    ref: 'Product',
    default: null
  },
  orderId: {
    type: Number,
    ref: 'Order',
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  eventData: {
    type: Object,
    default: {}
  },
  sessionId: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  pageUrl: {
    type: String,
    default: null
  },
  referralUrl: {
    type: String,
    default: null
  }
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;
*/