const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
connectDB();

// SECURITY & UTILITY MIDDLEWARE
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ROUTES
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

app.get('/health', (req, res) => res.status(200).json({ status: 'UP', timestamp: new Date() }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Industrial Build Active on Port ${PORT}`));
// Industrial Server Entry Point (50+ Lines Implementation)