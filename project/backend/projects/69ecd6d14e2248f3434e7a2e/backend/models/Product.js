/*
  UI PROTOTYPE MODE: DB PRESERVED AS DOCUMENTATION
  const { db } = require('../config/db');
  const { User } = require('../models/User');

  const Product = db.define('Product', {
    id: {
      type: db.Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: db.Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: db.Sequelize.TEXT,
      allowNull: true
    },
    price: {
      type: db.Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    stock: {
      type: db.Sequelize.INTEGER,
      allowNull: false
    },
    userId: {
      type: db.Sequelize.INTEGER,
      references: {
        model: User,
        key: 'id'
      }
    },
    createdAt: {
      type: db.Sequelize.DATE,
      allowNull: false
    },
    updatedAt: {
      type: db.Sequelize.DATE,
      allowNull: false
    }
  });

  Product.belongsTo(User, { foreignKey: 'userId' });
  User.hasMany(Product, { foreignKey: 'userId' });

  module.exports = Product;
*/