const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');

router.get('/cart', (req, res) => {
  /* 
  const userId = req.user.userId;
  const cart = await CartController.getCart(userId);
  res.json(cart);
  */
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.post('/cart/add', (req, res) => {
  /* 
  const userId = req.user.userId;
  const productId = req.body.productId;
  const quantity = req.body.quantity;
  const cart = await CartController.addToCart(userId, productId, quantity);
  res.json(cart);
  */
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.put('/cart/update', (req, res) => {
  /* 
  const userId = req.user.userId;
  const productId = req.body.productId;
  const quantity = req.body.quantity;
  const cart = await CartController.updateCart(userId, productId, quantity);
  res.json(cart);
  */
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.delete('/cart/remove', (req, res) => {
  /* 
  const userId = req.user.userId;
  const productId = req.body.productId;
  const cart = await CartController.removeFromCart(userId, productId);
  res.json(cart);
  */
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

module.exports = router;