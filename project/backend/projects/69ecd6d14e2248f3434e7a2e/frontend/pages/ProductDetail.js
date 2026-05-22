// backend/routes/product.js
const express = require('express');
const router = express.Router();
const { Product } = require('../models/Product');
const { db } = require('../config/db'); // Assuming 'db' is your database connection

// Fetch product by ID
router.get('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findOne({ where: { id: productId } });
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        return res.json(product);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;