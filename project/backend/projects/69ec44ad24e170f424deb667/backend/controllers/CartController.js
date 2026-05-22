const Cart = require('../models/Auth');
const database = require('../config/database');

exports.createCart = async (req, res) => {
  try {
    const cart = new Cart(req.body);
    const result = await cart.save();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

exports.getCart = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Cart.findById(id);
    if (!result) {
      return { success: false, data: 'Cart not found' };
    }
    return { success: true, data: result };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

exports.updateCart = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Cart.findByIdAndUpdate(id, req.body, { new: true });
    if (!result) {
      return { success: false, data: 'Cart not found' };
    }
    return { success: true, data: result };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

exports.deleteCart = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Cart.findByIdAndDelete(id);
    if (!result) {
      return { success: false, data: 'Cart not found' };
    }
    return { success: true, data: 'Cart deleted successfully' };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

exports.getAllCarts = async (req, res) => {
  try {
    const result = await Cart.find().populate('userId');
    return { success: true, data: result };
  } catch (error) {
    return { success: false, data: error.message };
  }
};