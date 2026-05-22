const express = require('express');
const { Product } = require('../models/Product');
const router = express.Router();

/* 
// CREATE a new product
router.post('/', async (req, res) => {
    const { name, description, price, stock, userId } = req.body;
    try {
        const newProduct = await Product.create({
            name,
            description,
            price,
            stock,
            userId,
        });
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});
*/

// READ all products
/*
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve products' });
    }
});
*/

// READ a single product by ID
/*
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve product' });
    }
});
*/

// UPDATE a product by ID
/*
router.put('/:id', async (req, res) => {
    const { name, description, price, stock, userId } = req.body;
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) {
            const updatedProduct = await product.update({
                name,
                description,
                price,
                stock,
                userId,
            });
            res.status(200).json(updatedProduct);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});
*/

// DELETE a product by ID
/*
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) {
            await product.destroy();
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});
*/

module.exports = router;