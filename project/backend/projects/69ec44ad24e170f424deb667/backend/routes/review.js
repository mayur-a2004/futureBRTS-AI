const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/ReviewController');
const auth = require('../config/auth');

router.get('/reviews', /* 
  async (req, res) => {
    try {
      const reviews = await ReviewController.getAllReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  } 
*/ (req, res) => {
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.post('/reviews', auth, /* 
  async (req, res) => {
    try {
      const review = await ReviewController.createReview(req.body);
      res.json(review);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  } 
*/ (req, res) => {
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.get('/reviews/:id', /* 
  async (req, res) => {
    try {
      const review = await ReviewController.getReviewById(req.params.id);
      res.json(review);
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  } 
*/ (req, res) => {
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.put('/reviews/:id', auth, /* 
  async (req, res) => {
    try {
      const review = await ReviewController.updateReview(req.params.id, req.body);
      res.json(review);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  } 
*/ (req, res) => {
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.delete('/reviews/:id', auth, /* 
  async (req, res) => {
    try {
      await ReviewController.deleteReview(req.params.id);
      res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  } 
*/ (req, res) => {
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});