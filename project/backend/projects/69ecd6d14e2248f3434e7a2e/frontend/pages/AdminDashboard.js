// backend/app.js
const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('./models/User');
const { Product } = require('./models/Product');
const app = express();

app.use(bodyParser.json());

// User Management Routes
app.get('/api/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

app.post('/api/users', async (req, res) => {
    const { username, email, password } = req.body;
    const newUser = await User.create({ username, email, password });
    res.status(201).json(newUser);
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, password } = req.body;
    const updatedUser = await User.update(
        { username, email, password },
        { where: { id } }
    );
    res.json(updatedUser);
});

app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const deletedUser = await User.destroy({ where: { id } });
    res.status(204).send();
});

// Product Management Routes
app.get('/api/products', async (req, res) => {
    const products = await Product.findAll();
    res.json(products);
});

app.post('/api/products', async (req, res) => {
    const { name, description, price, stock, userId } = req.body;
    const newProduct = await Product.create({ name, description, price, stock, userId });
    res.status(201).json(newProduct);
});

app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, userId } = req.body;
    const updatedProduct = await Product.update(
        { name, description, price, stock, userId },
        { where: { id } }
    );
    res.json(updatedProduct);
});

app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const deletedProduct = await Product.destroy({ where: { id } });
    res.status(204).send();
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});