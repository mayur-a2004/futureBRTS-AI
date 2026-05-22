const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

class OrderController {
  async createOrder(req, res) {
    try {
      const order = new Order(req.body);
      const savedOrder = await order.save();
      return { success: true, data: savedOrder };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }

  async getAllOrders(req, res) {
    try {
      const orders = await Order.find().populate('userId', 'name email');
      return { success: true, data: orders };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }

  async getOrderById(req, res) {
    try {
      const order = await Order.findById(req.params.id).populate('userId', 'name email');
      if (!order) {
        return { success: false, data: 'Order not found' };
      }
      return { success: true, data: order };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }

  async updateOrder(req, res) {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedOrder) {
        return { success: false, data: 'Order not found' };
      }
      return { success: true, data: updatedOrder };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }

  async deleteOrder(req, res) {
    try {
      const deletedOrder = await Order.findByIdAndDelete(req.params.id);
      if (!deletedOrder) {
        return { success: false, data: 'Order not found' };
      }
      return { success: true, data: deletedOrder };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }
}

module.exports = OrderController;