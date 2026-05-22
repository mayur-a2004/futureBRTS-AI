// backend/routes/cart.js

const express = require('express');
const { Product } = require('../models/Product');
const { Order } = require('../models/Order');
const { OrderItem } = require('../models/OrderItem');

const router = express.Router();

// Mock cart stored in memory (for demo purposes)
let cart = [];

// Get total price of items in the cart
const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Add item to cart
router.post('/add', async (req, res) => {
    const { productId, quantity } = req.body;
    const product = await Product.findOne({ where: { id: productId } });
    
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity
        });
    }

    res.json({ message: 'Item added to cart', cart, total: calculateTotalPrice() });
});

// Remove item from cart
router.delete('/remove/:productId', (req, res) => {
    const { productId } = req.params;
    cart = cart.filter(item => item.id !== parseInt(productId));
    res.json({ message: 'Item removed from cart', cart, total: calculateTotalPrice() });
});

// View cart
router.get('/', (req, res) => {
    res.json({ cart, total: calculateTotalPrice() });
});

module.exports = router;