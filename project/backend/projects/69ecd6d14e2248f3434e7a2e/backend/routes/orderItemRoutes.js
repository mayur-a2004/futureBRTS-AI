/* const express = require('express');
const router = express.Router();
const { OrderItem } = require('../models/OrderItem'); // Import OrderItem model
const { db } = require('../config/db'); // Import database connection

// Create an OrderItem
router.post('/order-items', async (req, res) => {
  try {
    const { orderId, references, productId, quantity, total, status } = req.body;
    const newItem = await OrderItem.create({
      orderId,
      references,
      productId,
      quantity,
      total,
      status,
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read all OrderItems
router.get('/order-items', async (req, res) => {
  try {
    const orderItems = await OrderItem.findAll();
    res.status(200).json(orderItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read a specific OrderItem
router.get('/order-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orderItem = await OrderItem.findOne({ where: { id } });
    if (!orderItem) return res.status(404).json({ error: 'OrderItem not found' });
    res.status(200).json(orderItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an OrderItem
router.put('/order-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { orderId, references, productId, quantity, total, status } = req.body;
    const [updated] = await OrderItem.update(
      { orderId, references, productId, quantity, total, status },
      { where: { id } }
    );
    if (!updated) return res.status(404).json({ error: 'OrderItem not found' });
    const updatedOrderItem = await OrderItem.findOne({ where: { id } });
    res.status(200).json(updatedOrderItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an OrderItem
router.delete('/order-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await OrderItem.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: 'OrderItem not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; */