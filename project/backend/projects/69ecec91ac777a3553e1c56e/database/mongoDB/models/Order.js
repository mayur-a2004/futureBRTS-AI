/*
module.exports = (mongoose) => {
  const Schema = mongoose.Schema;

  const OrderSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    shippingAddress: {
      type: String,
      required: true
    },
    billingAddress: {
      type: String,
      required: true
    },
    paymentMethod: {
      type: String,
      required: true
    },
    orderDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    trackingNumber: {
      type: String
    },
    shippingCost: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  });

  const Order = mongoose.model('Order', OrderSchema);

  return Order;
};
*/