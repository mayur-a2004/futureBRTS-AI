/* 
READY FOR CONNECTION - CURRENTLY IN UI PROTOTYPE MODE
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  total: { type: Number, required: true },
  status: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
*/