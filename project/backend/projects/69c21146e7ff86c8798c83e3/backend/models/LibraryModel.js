const Sequelize = require('sequelize');
const sequelize = new Sequelize('online_library', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

const Library = sequelize.define('Library', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  address: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  city: {
    type: Sequelize.STRING(100),
    allowNull: false
  },
  state: {
    type: Sequelize.STRING(100),
    allowNull: false
  },
  country: {
    type: Sequelize.STRING(100),
    allowNull: false
  },
  postalCode: {
    type: Sequelize.STRING(20),
    allowNull: false
  },
  phoneNumber: {
    type: Sequelize.STRING(20),
    allowNull: true
  },
  email: {
    type: Sequelize.STRING(100),
    allowNull: true,
    unique: true
  },
  website: {
    type: Sequelize.STRING(255),
    allowNull: true
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  }
}, {
  timestamps: true,
  freezeTableName: true,
  underscored: true
});

const Book = sequelize.define('Book', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  author: {
    type: Sequelize.STRING(100),
    allowNull: false
  },
  publisher: {
    type: Sequelize.STRING(100),
    allowNull: false
  },
  publicationDate: {
    type: Sequelize.DATE,
    allowNull: false
  },
  isbn: {
    type: Sequelize.STRING(20),
    allowNull: false,
    unique: true
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  libraryId: {
    type: Sequelize.INTEGER,
    references: {
      model: Library,
      key: 'id'
    }
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  }
}, {
  timestamps: true,
  freezeTableName: true,
  underscored: true
});

const Borrower = sequelize.define('Borrower', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING(100),
    allowNull: false
  },
  email: {
    type: Sequelize.STRING(100),
    allowNull: false,
    unique: true
  },
  phoneNumber: {
    type: Sequelize.STRING(20),
    allowNull: true
  },
  address: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  libraryId: {
    type: Sequelize.INTEGER,
    references: {
      model: Library,
      key: 'id'
    }
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  }
}, {
  timestamps: true,
  freezeTableName: true,
  underscored: true
});

const Borrowing = sequelize.define('Borrowing', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bookId: {
    type: Sequelize.INTEGER,
    references: {
      model: Book,
      key: 'id'
    }
  },
  borrowerId: {
    type: Sequelize.INTEGER,
    references: {
      model: Borrower,
      key: 'id'
    }
  },
  borrowingDate: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  returnDate: {
    type: Sequelize.DATE,
    allowNull: true
  },
  libraryId: {
    type: Sequelize.INTEGER,
    references: {
      model: Library,
      key: 'id'
    }
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  }
}, {
  timestamps: true,
  freezeTableName: true,
  underscored: true
});

Library.hasMany(Book, { foreignKey: 'libraryId' });
Book.belongsTo(Library, { foreignKey: 'libraryId' });

Library.hasMany(Borrower, { foreignKey: 'libraryId' });
Borrower.belongsTo(Library, { foreignKey: 'libraryId' });

Book.hasMany(Borrowing, { foreignKey: 'bookId' });
Borrowing.belongsTo(Book, { foreignKey: 'bookId' });

Borrower.hasMany(Borrowing, { foreignKey: 'borrowerId' });
Borrowing.belongsTo(Borrower, { foreignKey: 'borrowerId' });

Library.hasMany(Borrowing, { foreignKey: 'libraryId' });
Borrowing.belongsTo(Library, { foreignKey: 'libraryId' });

sequelize.sync({ force: true });