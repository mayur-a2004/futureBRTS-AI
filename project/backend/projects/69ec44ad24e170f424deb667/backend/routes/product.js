const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');

router.get('/products', /* (req, res) => {
  ProductController.getProducts(req, res);
} */ (req, res) => {
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.get('/products/:id', /* (req, res) => {
  ProductController.getProductById(req, res);
} */ (req, res) => {
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.post('/products', /* (req, res) => {
  ProductController.createProduct(req, res);
} */ (req, res) => {
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.put('/products/:id', /* (req, res) => {
  ProductController.updateProduct(req, res);
} */ (req, res) => {
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.delete('/products/:id', /* (req, res) => {
  ProductController.deleteProduct(req, res);
} */ (req, res) => {
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});