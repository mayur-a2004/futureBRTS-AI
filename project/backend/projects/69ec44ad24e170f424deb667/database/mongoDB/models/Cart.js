/* 
READY FOR CONNECTION - CURRENTLY IN UI PROTOTYPE MODE
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  products: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
      price: { type: Number },
      total: { type: Number }
    }
  ],
  total: { type: Number },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'] },
  paymentMethod: { type: String, enum: ['cash', 'card', 'online'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart;
*/