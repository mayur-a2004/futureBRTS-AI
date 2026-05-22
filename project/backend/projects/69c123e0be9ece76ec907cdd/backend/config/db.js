const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/db');
    console.log('✅ MONGO_SYNC_SUCCESS: ' + conn.connection.host);
  } catch (err) {
    console.error('❌ DB_SYNC_ERROR: ' + err.message);
    process.exit(1);
  }
};
module.exports = connectDB;