const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/ecommerce', { useNewUrlParser: true, useUnifiedTopology: true })
 .then(() => console.log('MongoDB Connected'))
 .catch(err => console.log(err));

// Product Schema
const ProductSchema = new mongoose.Schema({
 name: String,
 price: Number,
 description: String,
 image: String
});

const Product = mongoose.model('Product', ProductSchema);

// Routes
app.get('/api/products', async (req, res) => {
 try {
 const products = await Product.find();
 res.json(products);
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.post('/api/products', async (req, res) => {
 const product = new Product({
 name: req.body.name,
 price: req.body.price,
 description: req.body.description,
 image: req.body.image
 });

 try {
 const newProduct = await product.save();
 res.status(201).json(newProduct);
 } catch (err) {
 res.status(400).json({ message: err.message });
 }
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));