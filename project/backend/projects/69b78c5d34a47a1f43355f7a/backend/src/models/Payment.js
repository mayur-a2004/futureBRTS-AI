```javascript
// backend/src/models/Payment.js

/**
 * Represents a payment entity.
 * 
 * @module Payment
 */

// Import required modules
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the payment schema
const paymentSchema = new Schema({
    /**
     * Unique identifier for the payment.
     * @type {String}
     */
    paymentId: {
        type: String,
        required: true,
        unique: true
    },

    /**
     * The amount paid.
     * @type {Number}
     */
    amount: {
        type: Number,
        required: true
    },

    /**
     * The payment method used (e.g. credit card, PayPal, etc.).
     * @type {String}
     */
    paymentMethod: {
        type: String,
        required: true
    },

    /**
     * The date and time the payment was made.
     * @type {Date}
     */
    paymentDate: {
        type: Date,
        default: Date.now
    },

    /**
     * The status of the payment (e.g. pending, successful, failed).
     * @type {String}
     */
    status: {
        type: String,
        required: true
    },

    /**
     * The user who made the payment.
     * @type {ObjectId}
     */
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    /**
     * The order associated with the payment.
     * @type {ObjectId}
     */
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    }
});

// Create the payment model
const Payment = mongoose.model('Payment', paymentSchema);

// Export the payment model
module.exports = Payment;
```

### Payment Model Usage

To use the payment model, you can create a new payment document and save it to the database like this:

```javascript
// Create a new payment
const newPayment = new Payment({
    paymentId: 'PAY-12345',
    amount: 100.00,
    paymentMethod: 'Credit Card',
    status: 'Pending',
    userId: 'USER-12345',
    orderId: 'ORDER-12345'
});

// Save the payment to the database
newPayment.save((err, payment) => {
    if (err) {
        console.error(err);
    } else {
        console.log(payment);
    }
});
```

You can also retrieve payments from the database using the `find()` method:

```javascript
// Find all payments
Payment.find().then((payments) => {
    console.log(payments);
}).catch((err) => {
    console.error(err);
});
```

Or, you can update a payment using the `findOneAndUpdate()` method:

```javascript
// Update a payment
Payment.findOneAndUpdate({ paymentId: 'PAY-12345' }, { status: 'Successful' }, { new: true }, (err, payment) => {
    if (err) {
        console.error(err);
    } else {
        console.log(payment);
    }
});
```

### Payment Model Validation

To validate payments, you can use the `validate()` method:

```javascript
// Validate a payment
const payment = new Payment({
    paymentId: 'PAY-12345',
    amount: 100.00,
    paymentMethod: 'Credit Card',
    status: 'Pending',
    userId: 'USER-12345',
    orderId: 'ORDER-12345'
});

payment.validate((err) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Payment is valid');
    }
});
```

### Payment Model Hooks

To add hooks to the payment model, you can use the `pre()` and `post()` methods:

```javascript
// Add a pre-save hook
paymentSchema.pre('save', (next) => {
    console.log('Pre-save hook');
    next();
});

// Add a post-save hook
paymentSchema.post('save', (doc) => {
    console.log('Post-save hook');
});
```

### Payment Model Static Methods

To add static methods to the payment model, you can use the `statics` object:

```javascript
// Add a static method to get all payments for a user
paymentSchema.statics.getUserPayments = function(userId) {
    return this.find({ userId: userId });
};

// Use the static method
Payment.getUserPayments('USER-12345').then((payments) => {
    console.log(payments);
}).catch((err) => {
    console.error(err);
});
```

### Payment Model Instance Methods

To add instance methods to the payment model, you can use the `methods` object:

```javascript
// Add an instance method to update the payment status
paymentSchema.methods.updateStatus = function(status) {
    this.status = status;
    return this.save();
};

// Use the instance method
const payment = new Payment({
    paymentId: 'PAY-12345',
    amount: 100.00,
    paymentMethod: 'Credit Card',
    status: 'Pending',
    userId: 'USER-12345',
    orderId: 'ORDER-12345'
});

payment.updateStatus('Successful').then((payment) => {
    console.log(payment);
}).catch((err) => {
    console.error(err);
});
```