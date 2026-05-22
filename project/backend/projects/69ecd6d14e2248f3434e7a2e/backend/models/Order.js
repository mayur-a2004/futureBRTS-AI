const { db } = require('../config/db');
const { User } = require('../models/User');
const { Product } = require('../models/Product');

const Order = db.define('Order', {
  id: {
    type: db.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: db.Sequelize.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  productId: {
    type: db.Sequelize.INTEGER,
    references: {
      model: Product,
      key: 'id'
    }
  },
  quantity: {
    type: db.Sequelize.INTEGER,
    defaultValue: 1
  },
  total: {
    type: db.Sequelize.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  status: {
    type: db.Sequelize.ENUM('pending', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  createdAt: {
    type: db.Sequelize.DATE,
    defaultValue: db.Sequelize.NOW
  },
  updatedAt: {
    type: db.Sequelize.DATE,
    defaultValue: db.Sequelize.NOW
  }
}, {
  timestamps: true
});

Order.belongsTo(User, { foreignKey: 'userId' });
Order.belongsTo(Product, { foreignKey: 'productId' });

module.exports = Order;
UI PROTOTYPE MODE: DB PRESERVED AS DOCUMENTATION
*/