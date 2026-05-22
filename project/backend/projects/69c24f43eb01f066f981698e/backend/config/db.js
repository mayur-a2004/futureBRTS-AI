const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_URI || 'postgres://user:pass@localhost:5432/db');
const connectDB = async () => {
  try { await sequelize.authenticate(); console.log('✅ SQL_SYNC_SUCCESS'); } catch (err) { console.error('❌ DB_SYNC_ERROR', err); }
};
module.exports = connectDB;