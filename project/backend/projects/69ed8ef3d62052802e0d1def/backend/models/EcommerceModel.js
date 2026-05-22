/* 
   UI PROTOTYPE MODE: BACKEND LOGIC PRESERVED AS DOCUMENTATION
   -----------------------------------------------------------
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 32
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  price: {
    type: Number,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  stock: {
    type: Number
  },
  sold: {
    type: Number,
    default: 0
  },
  photo: {
    data: Buffer,
    contentType: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date,
  vendor: {
    type: ObjectId,
    ref: 'User'
  },
  reviews: [
    {
      reviewer: {
        type: ObjectId,
        ref: 'User'
      },
      review: String,
      rating: Number,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const orderSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: ObjectId,
        ref: 'Product'
      },
      count: Number,
      price: Number
    }
  ],
  transaction_id: {},
  amount: {
    type: Number
  },
  address: {
    type: String,
    required: true
  },
  updated: Date,
  user: {
    type: ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'Not processed',
    enum: ['Not processed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
  }
}, {
  timestamps: true
});

const paymentSchema = new mongoose.Schema({
  paymentMethod: {
    type: String,
    enum: ['Stripe', 'PayPal']
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Success', 'Failed']
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  amount: {
    type: Number
  },
  user: {
    type: ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const wishlistSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: ObjectId,
        ref: 'Product'
      }
    }
  ],
  user: {
    type: ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const cartSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: ObjectId,
        ref: 'Product'
      },
      count: Number,
      price: Number
    }
  ],
  user: {
    type: ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Wishlist = mongoose.model('Wishlist', wishlistSchema);
const Cart = mongoose.model('Cart', cartSchema);

module.exports = { Product, Order, Payment, Wishlist, Cart };
*/
*/