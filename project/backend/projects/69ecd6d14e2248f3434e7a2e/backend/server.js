const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// Initialize Database
connectDB();

// Dynamic Neural Routes Mounting
try {
  const mainRoutes = require('./routes/mainRoutes');
  app.use('/api', mainRoutes);
  console.log('✅ NEURAL_ROUTES_SYNCED: /api');
} catch(e) {
  console.warn('⚠️ Routes module pending synthesis.', e.message);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('🚀 SYSTEM DEPLOYED ON PORT ' + PORT));