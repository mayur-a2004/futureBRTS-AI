const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');

router.get('/orders', (req, res) => {
  /* 
  const orders = await OrderController.getAllOrders();
  res.json(orders);
  */
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.get('/orders/:id', (req, res) => {
  /* 
  const order = await OrderController.getOrderById(req.params.id);
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ success: false, message: "Order not found" });
  }
  */
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.post('/orders', (req, res) => {
  /* 
  const order = await OrderController.createOrder(req.body);
  res.json(order);
  */
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.put('/orders/:id', (req, res) => {
  /* 
  const order = await OrderController.updateOrder(req.params.id, req.body);
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ success: false, message: "Order not found" });
  }
  */
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.delete('/orders/:id', (req, res) => {
  /* 
  const order = await OrderController.deleteOrder(req.params.id);
  if (order) {
    res.json({ success: true, message: "Order deleted successfully" });
  } else {
    res.status(404).json({ success: false, message: "Order not found" });
  }
  */
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

module.exports = router;