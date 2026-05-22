```javascript
// backend/src/models/Borrowing.js

/**
 * Represents a borrowing entity.
 * 
 * @module Borrowing
 */

// Import required modules
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the borrowing schema
const borrowingSchema = new Schema({
  /**
   * The ID of the user who borrowed the item.
   * @type {ObjectId}
   * @required
   */
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },

  /**
   * The ID of the item being borrowed.
   * @type {ObjectId}
   * @required
   */
  itemId: { type: Schema.Types.ObjectId, required: true, ref: 'Item' },

  /**
   * The date the item was borrowed.
   * @type {Date}
   * @required
   */
  borrowDate: { type: Date, required: true, default: Date.now },

  /**
   * The expected return date of the item.
   * @type {Date}
   * @required
   */
  returnDate: { type: Date, required: true },

  /**
   * The actual return date of the item.
   * @type {Date}
   */
  actualReturnDate: { type: Date },

  /**
   * The status of the borrowing (e.g. "borrowed", "returned", "overdue").
   * @type {String}
   * @required
   */
  status: { type: String, required: true, enum: ['borrowed', 'returned', 'overdue'] },

  /**
   * Any additional notes or comments about the borrowing.
   * @type {String}
   */
  notes: { type: String }
});

// Define a method to update the status of the borrowing
borrowingSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// Define a method to update the actual return date of the borrowing
borrowingSchema.methods.updateActualReturnDate = function(returnDate) {
  this.actualReturnDate = returnDate;
  return this.save();
};

// Define a method to check if the borrowing is overdue
borrowingSchema.methods.isOverdue = function() {
  const today = new Date();
  return today > this.returnDate;
};

// Create the Borrowing model
const Borrowing = mongoose.model('Borrowing', borrowingSchema);

// Export the Borrowing model
module.exports = Borrowing;
```

### Example Use Cases

```javascript
// Create a new borrowing
const borrowing = new Borrowing({
  userId: 'user123',
  itemId: 'item456',
  returnDate: new Date('2024-03-16')
});

// Save the borrowing to the database
borrowing.save((err, borrowing) => {
  if (err) {
    console.error(err);
  } else {
    console.log(borrowing);
  }
});

// Update the status of the borrowing
Borrowing.findById('borrowing123', (err, borrowing) => {
  if (err) {
    console.error(err);
  } else {
    borrowing.updateStatus('returned', (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Borrowing status updated');
      }
    });
  }
});

// Check if the borrowing is overdue
Borrowing.findById('borrowing123', (err, borrowing) => {
  if (err) {
    console.error(err);
  } else {
    if (borrowing.isOverdue()) {
      console.log('Borrowing is overdue');
    } else {
      console.log('Borrowing is not overdue');
    }
  }
});
```

### API Endpoints

The following API endpoints can be used to interact with the Borrowing model:

* `POST /borrowings`: Create a new borrowing
* `GET /borrowings`: Retrieve a list of all borrowings
* `GET /borrowings/:id`: Retrieve a single borrowing by ID
* `PUT /borrowings/:id`: Update a borrowing
* `DELETE /borrowings/:id`: Delete a borrowing

Note: These API endpoints are just examples and may need to be modified to fit the specific requirements of your application.