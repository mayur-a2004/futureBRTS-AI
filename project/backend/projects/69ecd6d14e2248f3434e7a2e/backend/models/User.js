const { db } = require('../config/db');

const User = db.define('User', {
  id: {
    type: db.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: db.Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: db.Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: db.Sequelize.STRING,
    allowNull: false
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

module.exports = User;

UI PROTOTYPE MODE: DB PRESERVED AS DOCUMENTATION
*/