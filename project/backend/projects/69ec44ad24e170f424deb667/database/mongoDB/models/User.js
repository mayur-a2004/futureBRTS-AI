const mongoose = require('mongoose');
const { Schema } = mongoose;

/* 
READY FOR CONNECTION - CURRENTLY IN UI PROTOTYPE MODE
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  description: { type: String },
  price: { type: Number },
  stock: { type: Number },
  category: { type: String },
  subCategory: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  total: { type: Number },
  status: { type: String },
  paymentMethod: { type: String }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
*/