// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const { Order } = require('../models/Order');
const { OrderItem } = require('../models/OrderItem');

router.get('/orders/:userId', async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.params.userId },
            include: [{
                model: OrderItem,
                as: 'orderItems'
            }]
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;