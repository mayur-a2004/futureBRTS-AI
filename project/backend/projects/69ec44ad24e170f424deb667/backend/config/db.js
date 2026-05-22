const mongoose = require('mongoose');
const connectDB = async () => {
  try { await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/db');
  console.log('✅ MONGO_SYNC_SUCCESS'); } catch (err) { console.error('❌ DB_SYNC_ERROR'); process.exit(1); }
};
module.exports = connectDB;