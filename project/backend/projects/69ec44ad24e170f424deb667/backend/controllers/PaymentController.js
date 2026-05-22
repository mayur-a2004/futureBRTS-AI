const Payment = require('../models/Auth');
const database = require('../config/database');

const createPayment = async (req, res) => {
  try {
    const payment = new Payment(req.body);
    const savedPayment = await payment.save();
    return { success: true, data: savedPayment };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

const readPayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return { success: false, data: 'Payment not found' };
    }
    return { success: true, data: payment };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

const updatePayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const updatedPayment = await Payment.findByIdAndUpdate(paymentId, req.body, { new: true });
    if (!updatedPayment) {
      return { success: false, data: 'Payment not found' };
    }
    return { success: true, data: updatedPayment };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

const deletePayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const deletedPayment = await Payment.findByIdAndDelete(paymentId);
    if (!deletedPayment) {
      return { success: false, data: 'Payment not found' };
    }
    return { success: true, data: 'Payment deleted successfully' };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    return { success: true, data: payments };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

module.exports = {
  createPayment,
  readPayment,
  updatePayment,
  deletePayment,
  getAllPayments
};