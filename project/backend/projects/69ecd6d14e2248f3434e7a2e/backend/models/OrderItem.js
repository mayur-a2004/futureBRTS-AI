const { db } = require('../config/db');
const { Order } = require('../models/Order');
const { Product } = require('../models/Product');

const OrderItem = db.define('OrderItem', {
  id: {
    type: db.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: db.Sequelize.INTEGER,
    references: {
      model: Order,
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
  timestamps: true,
  freezeTableName: true
});

OrderItem.associate = function(models) {
  OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
  OrderItem.belongsTo(Product, { foreignKey: 'productId' });
};

module.exports = OrderItem;
UI PROTOTYPE MODE: DB PRESERVED AS DOCUMENTATION
*/