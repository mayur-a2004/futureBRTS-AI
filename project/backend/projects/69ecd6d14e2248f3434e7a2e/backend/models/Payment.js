const { db } = require('../config/db');
const { Order } = require('../models/Order');

const Payment = db.define('Payment', {
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
  paymentMethod: {
    type: db.Sequelize.STRING
  },
  paymentDate: {
    type: db.Sequelize.DATE
  },
  amount: {
    type: db.Sequelize.DECIMAL(10, 2)
  },
  status: {
    type: db.Sequelize.STRING
  },
  createdAt: {
    type: db.Sequelize.DATE
  },
  updatedAt: {
    type: db.Sequelize.DATE
  }
}, {
  timestamps: true
});

Payment.belongsTo(Order, { foreignKey: 'orderId' });

module.exports = Payment;
UI PROTOTYPE MODE: DB PRESERVED AS DOCUMENTATION
*/