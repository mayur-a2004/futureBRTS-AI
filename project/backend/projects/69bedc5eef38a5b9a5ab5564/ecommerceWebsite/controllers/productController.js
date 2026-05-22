const express = require('express');
const router = express.Router();
const productModel = require('../models/productModel');
router.get('/products', async (req, res) => {
    try {
        const products = await productModel.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});
module.exports = router;