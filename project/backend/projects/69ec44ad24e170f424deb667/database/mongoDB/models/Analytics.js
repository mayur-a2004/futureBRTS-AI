/* 
READY FOR CONNECTION - CURRENTLY IN UI PROTOTYPE MODE
const mongoose = require('mongoose');
const { Schema } = mongoose;

const analyticsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productCategory: {
    type: String,
    required: true
  },
  productSubCategory: {
    type: String,
    required: true
  },
  productPrice: {
    type: Number,
    required: true
  },
  productStock: {
    type: Number,
    required: true
  },
  productStatus: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Analytics = mongoose.model('Analytics', analyticsSchema);
module.exports = Analytics;
*/