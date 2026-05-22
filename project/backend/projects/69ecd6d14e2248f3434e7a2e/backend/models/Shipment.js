const { db } = require('../config/db');
const { Order } = require('../models/Order');

const Shipment = db.define('Shipment', {
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
  trackingNumber: {
    type: db.Sequelize.STRING
  },
  carrier: {
    type: db.Sequelize.STRING
  },
  shippingDate: {
    type: db.Sequelize.DATE
  },
  estimatedDeliveryDate: {
    type: db.Sequelize.DATE
  },
  deliveryDate: {
    type: db.Sequelize.DATE
  },
  status: {
    type: db.Sequelize.STRING
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

Shipment.belongsTo(Order, { foreignKey: 'orderId' });

module.exports = { Shipment };

UI PROTOTYPE MODE: DB PRESERVED AS DOCUMENTATION
*/