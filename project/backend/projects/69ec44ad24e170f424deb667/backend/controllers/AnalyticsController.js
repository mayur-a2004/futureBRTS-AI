const Auth = require('../models/Auth');
const User = require('../models/User');
const Product = require('../models/Product');

class AnalyticsController {
  async getAllAnalytics(req, res) {
    try {
      const analytics = await User.find();
      return { success: true, data: analytics };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }

  async getAnalyticsById(req, res) {
    try {
      const id = req.params.id;
      const analytics = await User.findById(id);
      if (!analytics) {
        return { success: false, data: 'Analytics not found' };
      }
      return { success: true, data: analytics };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }

  async createAnalytics(req, res) {
    try {
      const newAnalytics = new User(req.body);
      const savedAnalytics = await newAnalytics.save();
      return { success: true, data: savedAnalytics };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }

  async updateAnalytics(req, res) {
    try {
      const id = req.params.id;
      const updatedAnalytics = await User.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedAnalytics) {
        return { success: false, data: 'Analytics not found' };
      }
      return { success: true, data: updatedAnalytics };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }

  async deleteAnalytics(req, res) {
    try {
      const id = req.params.id;
      const deletedAnalytics = await User.findByIdAndDelete(id);
      if (!deletedAnalytics) {
        return { success: false, data: 'Analytics not found' };
      }
      return { success: true, data: 'Analytics deleted successfully' };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }
}

module.exports = AnalyticsController;