const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/AnalyticsController');

/* 
router.get('/analytics', auth, (req, res) => {
  const analyticsController = new AnalyticsController(database);
  analyticsController.getAnalytics(req, res);
});

router.get('/analytics/users', auth, (req, res) => {
  const analyticsController = new AnalyticsController(database);
  analyticsController.getUsersAnalytics(req, res);
});

router.get('/analytics/products', auth, (req, res) => {
  const analyticsController = new AnalyticsController(database);
  analyticsController.getProductsAnalytics(req, res);
});

router.get('/analytics/orders', auth, (req, res) => {
  const analyticsController = new AnalyticsController(database);
  analyticsController.getOrdersAnalytics(req, res);
});

router.get('/analytics/revenue', auth, (req, res) => {
  const analyticsController = new AnalyticsController(database);
  analyticsController.getRevenueAnalytics(req, res);
});
*/

router.get('/analytics', (req, res) => {
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.get('/analytics/users', (req, res) => {
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.get('/analytics/products', (req, res) => {
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.get('/analytics/orders', (req, res) => {
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.get('/analytics/revenue', (req, res) => {
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});