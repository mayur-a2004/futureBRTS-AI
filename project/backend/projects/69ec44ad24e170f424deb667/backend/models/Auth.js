const { database } = require('../config/database');
const { auth } = require('../config/auth');
const User = require('../models/User');

/* 
READY FOR CONNECTION - CURRENTLY IN UI PROTOTYPE MODE
const Auth = database.model('Auth', {
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  role: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  description: { type: String },
  price: { type: Number },
  stock: { type: Number },
  category: { type: String },
  subCategory: { type: String },
  userId: { type: String },
  total: { type: Number },
  status: { type: String },
  paymentMethod: { type: String }
});

Auth.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Auth, { foreignKey: 'userId' });
*/

module.exports = {};