const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

connectDB();

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/main', require('./routes/mainRoutes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('🚀 API GATEWAY DEPLOYED ON PORT ' + PORT));