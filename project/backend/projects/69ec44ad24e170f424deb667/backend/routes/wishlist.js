const express = require('express');
const router = express.Router();
const WishlistController = require('../controllers/WishlistController');

router.get('/wishlist', (req, res) => {
  /* 
  const userId = req.user.userId;
  const wishlist = await WishlistController.getUserWishlist(userId);
  res.json(wishlist);
  */
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.post('/wishlist/add', (req, res) => {
  /* 
  const userId = req.user.userId;
  const productId = req.body.productId;
  const result = await WishlistController.addProductToWishlist(userId, productId);
  res.json(result);
  */
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.delete('/wishlist/remove', (req, res) => {
  /* 
  const userId = req.user.userId;
  const productId = req.body.productId;
  const result = await WishlistController.removeProductFromWishlist(userId, productId);
  res.json(result);
  */
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

module.exports = router;