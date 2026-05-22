```javascript
// backend/src/controllers/PaymentController.js

const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/paymentDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Define the payment model
const paymentModel = mongoose.model('Payment', {
  amount: Number,
  currency: String,
  paymentId: String,
  orderId: String,
  status: String
});

// Create a new instance of Razorpay
const razorpay = new Razorpay({
  key_id: 'YOUR_RAZORPAY_KEY_ID',
  key_secret: 'YOUR_RAZORPAY_KEY_SECRET'
});

// Generate a payment order
router.post('/generate-order', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const options = {
      amount: amount * 100, // convert to paise
      currency,
      payment_capture: 1 // 1 for automatic capture, 2 for manual capture
    };

    const order = await razorpay.orders.create(options);
    const payment = new paymentModel({
      amount: order.amount / 100, // convert to rupees
      currency: order.currency,
      paymentId: order.id,
      orderId: order.id,
      status: 'pending'
    });

    await payment.save();
    res.json({ id: order.id, currency: order.currency, amount: order.amount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating payment order' });
  }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { paymentId, orderId, signature } => req.body;
    const payment = await paymentModel.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const generatedSignature = razorpay.utils.verifyPaymentSignature({
      order_id: orderId,
      payment_id: paymentId,
      razorpay_signature: signature
    });

    if (generatedSignature) {
      payment.status = 'success';
      await payment.save();
      res.json({ message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
});

// Get payment status
router.get('/payment-status/:paymentId', async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    const payment = await paymentModel.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ status: payment.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting payment status' });
  }
});

module.exports = router;
```

### Frontend Integration

To integrate this payment controller with your frontend, you can use the following code:

```javascript
// frontend/src/components/PaymentForm.js

import React, { useState } from 'react';
import axios from 'axios';

const PaymentForm = () => {
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState('INR');
  const [paymentId, setPaymentId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [signature, setSignature] = useState('');

  const handlePayment = async () => {
    try {
      const response = await axios.post('/api/generate-order', {
        amount,
        currency
      });

      const { id, currency, amount } = response.data;
      setPaymentId(id);
      setOrderId(id);

      // Open Razorpay payment modal
      const options = {
        key: 'YOUR_RAZORPAY_KEY_ID',
        amount,
        currency,
        name: 'Your Company Name',
        description: 'Test Transaction',
        image: 'https://example.com/your_company_logo.png',
        order_id: id,
        handler: async (response) => {
          try {
            await axios.post('/api/verify-payment', {
              paymentId: response.razorpay_payment_id,
              orderId: id,
              signature: response.razorpay_signature
            });

            console.log('Payment successful!');
          } catch (error) {
            console.error(error);
          }
        },
        prefill: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          contact: '9999999999'
        },
        notes: {
          address: 'Hello World'
        },
        theme: {
          color: '#3399cc'
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', (response) => {
        console.log('Payment failed!');
      });
      rzp1.open();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
        <option value="INR">INR</option>
        <option value="USD">USD</option>
      </select>
      <button onClick={handlePayment}>Make Payment</button>
    </div>
  );
};

export default PaymentForm;
```

### API Endpoints

The following API endpoints are available:

* `POST /api/generate-order`: Generate a new payment order.
* `POST /api/verify-payment`: Verify a payment.
* `GET /api/payment-status/:paymentId`: Get the status of a payment.

### Notes

* Make sure to replace `YOUR_RAZORPAY_KEY_ID` and `YOUR_RAZORPAY_KEY_SECRET` with your actual Razorpay key ID and key secret.
* This code assumes that you have already set up a Razorpay account and have generated a key ID and key secret.
* This code also assumes that you have already installed the required dependencies, including `express`, `mongoose`, and `razorpay`.
* You may need to modify the code to fit your specific use case.