// backend/routes/checkout.js

const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { User } = require('../models/User');
const { Product } = require('../models/Product');
const { Order } = require('../models/Order');
const { OrderItem } = require('../models/OrderItem');
const { Payment } = require('../models/Payment'); // Assuming you have that

// POST checkout
router.post('/checkout', async (req, res) => {
    const { userId, items, paymentInfo } = req.body;

    if (!userId || !items || items.length === 0 || !paymentInfo) {
        return res.status(400).send('Invalid checkout data');
    }

    try {
        // Fetch user to validate existence
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Calculate total
        let total = 0;
        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (product && product.stock >= item.quantity) {
                total += product.price * item.quantity;

                // Optionally update product stock
                product.stock -= item.quantity;
                await product.save();
            } else {
                return res.status(400).send('Insufficient stock for product: ' + item.productId);
            }
        }

        // Create order
        const order = await Order.create({
            userId,
            references: generateReference(), // Function to generate order reference
            total,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Create OrderItems
        for (const item of items) {
            await OrderItem.create({
                orderId: order.id,
                references: generateReference(), 
                productId: item.productId,
                quantity: item.quantity,
                total: item.quantity * item.price,
                status: 'pending', 
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        // Handle payment processing (pseudo-code)
        const paymentResult = await processPayment(paymentInfo); // You would implement this function to handle payment

        if (paymentResult.success) {
            // Update order status
            order.status = 'completed';
            await order.save();

            res.status(200).json({ orderId: order.id, message: 'Order completed successfully' });
        } else {
            // handle payment failure
            res.status(400).send('Payment failed');
        }       
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;

function generateReference() {
    // Function to generate unique reference for order and order items
    return Math.random().toString(36).substring(2, 15);
}