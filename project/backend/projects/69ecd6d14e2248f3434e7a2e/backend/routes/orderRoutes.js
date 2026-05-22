const express = require('express');
const router = express.Router();
const { Order } = require('../models/Order');
const { User } = require('../models/User');
const { Product } = require('../models/Product');

/* 
  GET /orders - Retrieve all orders
*/
router.get('/orders', async (req, res) => {
  /* 
    const orders = await Order.findAll(); 
    res.json(orders);
  */
});

/* 
  GET /orders/:id - Retrieve a specific order by ID
*/
router.get('/orders/:id', async (req, res) => {
  /* 
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).send('Order not found');
    }
    res.json(order);
  */
});

/* 
  POST /orders - Create a new order
*/
router.post('/orders', async (req, res) => {
  /* 
    const { userId, references, productId, quantity, total, status } = req.body;
    const order = await Order.create({ userId, references, productId, quantity, total, status });
    res.status(201).json(order);
  */
});

/* 
  PUT /orders/:id - Update an existing order
*/
router.put('/orders/:id', async (req, res) => {
  /* 
    const { userId, references, productId, quantity, total, status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).send('Order not found');
    }
    await order.update({ userId, references, productId, quantity, total, status });
    res.json(order);
  */
});

/* 
  DELETE /orders/:id - Delete an existing order
*/
router.delete('/orders/:id', async (req, res) => {
  /* 
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).send('Order not found');
    }
    await order.destroy();
    res.status(204).send();
  */
});

module.exports = router;