const Review = require('../models/Review');
const User = require('../models/User');
const Product = require('../models/Product');

class ReviewController {
  async createReview(req, res) {
    try {
      const review = new Review(req.body);
      const savedReview = await review.save();
      return { success: true, data: savedReview };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }

  async getReviews(req, res) {
    try {
      const reviews = await Review.find().populate('userId', 'name').populate('productId', 'name');
      return { success: true, data: reviews };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }

  async getReviewById(req, res) {
    try {
      const review = await Review.findById(req.params.id).populate('userId', 'name').populate('productId', 'name');
      if (!review) {
        return { success: false, data: 'Review not found' };
      }
      return { success: true, data: review };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }

  async updateReview(req, res) {
    try {
      const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!review) {
        return { success: false, data: 'Review not found' };
      }
      return { success: true, data: review };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }

  async deleteReview(req, res) {
    try {
      const review = await Review.findByIdAndDelete(req.params.id);
      if (!review) {
        return { success: false, data: 'Review not found' };
      }
      return { success: true, data: 'Review deleted successfully' };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }
}

module.exports = ReviewController;