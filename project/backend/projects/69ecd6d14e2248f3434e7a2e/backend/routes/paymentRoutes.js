const express = require('express');
const router = express.Router();
const db = require('../config/db');
const Payment = require('../models/Payment').Payment;

/* 
  Business Logic for Payment API
  This section includes all CRUD operations for managing payments.

  Create a new payment
*/
router.post('/payments', async (req, res) => {
  try {
    const { amount, orderId, userId, status } = req.body;
    const newPayment = await Payment.create({ amount, orderId, userId, status });
    res.status(201).json(newPayment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment', error: error.message });
  }
});

/* 
  Retrieve all payments
*/
router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.findAll();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

/* 
  Retrieve a specific payment by ID
*/
router.get('/payments/:id', async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment', error: error.message });
  }
});

/* 
  Update a specific payment by ID
*/
router.put('/payments/:id', async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    const { amount, orderId, userId, status } = req.body;
    payment.amount = amount;
    payment.orderId = orderId;
    payment.userId = userId;
    payment.status = status;
    
    await payment.save();
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment', error: error.message });
  }
});

/* 
  Delete a specific payment by ID
*/
router.delete('/payments/:id', async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    await payment.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting payment', error: error.message });
  }
});

/* 
  Exporting the router for use in the main application.
*/
module.exports = router;