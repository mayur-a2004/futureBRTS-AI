const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('🚀 SYSTEM DEPLOYED ON PORT ' + PORT));