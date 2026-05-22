```javascript
// backend/src/controllers/PaymentController.js

const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const mongoose = require('mongoose');

// Connect to MongoDB
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

// Generate payment order
router.post('/generate-order', async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const options = {
            amount: amount * 100, // convert to paise
            currency: currency,
            payment_capture: 1 // auto capture
        };

        const order = await razorpay.orders.create(options);
        const payment = new paymentModel({
            amount: amount,
            currency: currency,
            paymentId: order.id,
            orderId: order.id,
            status: 'pending'
        });

        await payment.save();
        res.json({ order, payment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating payment order' });
    }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
    try {
        const { paymentId, orderId, signature } => req.body;
        const payment = await paymentModel.findOne({ paymentId: paymentId });

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
        const payment = await paymentModel.findOne({ paymentId: paymentId });

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

### API Endpoints

1. **Generate Payment Order**: `POST /generate-order`
    * Request Body: `{ amount: number, currency: string }`
    * Response: `{ order: object, payment: object }`
2. **Verify Payment**: `POST /verify-payment`
    * Request Body: `{ paymentId: string, orderId: string, signature: string }`
    * Response: `{ message: string }`
3. **Get Payment Status**: `GET /payment-status/:paymentId`
    * Response: `{ status: string }`

### Example Use Cases

1. Generate a payment order for an amount of ₹100:
```json
POST /generate-order HTTP/1.1
Content-Type: application/json

{
    "amount": 100,
    "currency": "INR"
}
```
Response:
```json
{
    "order": {
        "id": "order_DBJO4r0G3K0eOz",
        "entity": "order",
        "amount": 10000,
        "amount_paid": 0,
        "amount_due": 10000,
        "currency": "INR",
        "receipt": "receipt#1",
        "offer_id": null,
        "status": "created",
        "attempts": 0,
        "notes": [],
        "created_at": 1643723904
    },
    "payment": {
        "_id": "61f71f5f9c9d9c9d9c9d9c9d9",
        "amount": 100,
        "currency": "INR",
        "paymentId": "order_DBJO4r0G3K0eOz",
        "orderId": "order_DBJO4r0G3K0eOz",
        "status": "pending"
    }
}
```
2. Verify a payment with payment ID `order_DBJO4r0G3K0eOz` and signature `signature#1`:
```json
POST /verify-payment HTTP/1.1
Content-Type: application/json

{
    "paymentId": "order_DBJO4r0G3K0eOz",
    "orderId": "order_DBJO4r0G3K0eOz",
    "signature": "signature#1"
}
```
Response:
```json
{
    "message": "Payment verified successfully"
}
```
3. Get the payment status for payment ID `order_DBJO4r0G3K0eOz`:
```json
GET /payment-status/order_DBJO4r0G3K0eOz HTTP/1.1
```
Response:
```json
{
    "status": "success"
}
```