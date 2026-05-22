```javascript
// backend/src/models/Borrowing.js

// Import required modules
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the borrowing entity and schema
const borrowingSchema = new Schema({
  /**
   * Unique identifier for the borrowing
   */
  _id: {
    type: String,
    required: true,
    unique: true,
  },
  /**
   * User who borrowed the item
   */
  user: {
    type: String,
    required: true,
    ref: 'User',
  },
  /**
   * Item being borrowed
   */
  item: {
    type: String,
    required: true,
    ref: 'Item',
  },
  /**
   * Date the item was borrowed
   */
  borrowDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  /**
   * Date the item is due to be returned
   */
  dueDate: {
    type: Date,
    required: true,
  },
  /**
   * Date the item was returned
   */
  returnDate: {
    type: Date,
  },
  /**
   * Status of the borrowing (e.g. "borrowed", "returned", "overdue")
   */
  status: {
    type: String,
    required: true,
    enum: ['borrowed', 'returned', 'overdue'],
    default: 'borrowed',
  },
  /**
   * Any additional notes or comments about the borrowing
   */
  notes: {
    type: String,
  },
});

// Create a model based on the schema
const Borrowing = mongoose.model('Borrowing', borrowingSchema);

// Export the model
module.exports = Borrowing;
```

### Example Use Cases

#### Creating a new borrowing
```javascript
const borrowing = new Borrowing({
  _id: 'BOR-123',
  user: 'USR-123',
  item: 'ITM-123',
  dueDate: new Date('2024-09-20'),
});

borrowing.save((err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Borrowing created successfully');
  }
});
```

#### Retrieving all borrowings for a user
```javascript
Borrowing.find({ user: 'USR-123' })
  .populate('item')
  .exec((err, borrowings) => {
    if (err) {
      console.error(err);
    } else {
      console.log(borrowings);
    }
  });
```

#### Updating the status of a borrowing
```javascript
Borrowing.findByIdAndUpdate('BOR-123', { status: 'returned' }, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Borrowing status updated successfully');
  }
});
```

### API Endpoints

The following API endpoints can be created to interact with the borrowing model:

* `POST /borrowings`: Create a new borrowing
* `GET /borrowings`: Retrieve all borrowings
* `GET /borrowings/:id`: Retrieve a borrowing by ID
* `PUT /borrowings/:id`: Update a borrowing
* `DELETE /borrowings/:id`: Delete a borrowing

### Frontend Integration

The borrowing model can be integrated with the frontend using RESTful API endpoints. For example, the frontend can send a `POST` request to `http://localhost:3000/borrowings` to create a new borrowing.

```javascript
// frontend/src/components/BorrowingForm.js
import React, { useState } from 'react';
import axios from 'axios';

const BorrowingForm = () => {
  const [borrowing, setBorrowing] = useState({
    user: '',
    item: '',
    dueDate: '',
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.post('http://localhost:3000/borrowings', borrowing)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        User:
        <input type="text" value={borrowing.user} onChange={(event) => setBorrowing({ ...borrowing, user: event.target.value })} />
      </label>
      <label>
        Item:
        <input type="text" value={borrowing.item} onChange={(event) => setBorrowing({ ...borrowing, item: event.target.value })} />
      </label>
      <label>
        Due Date:
        <input type="date" value={borrowing.dueDate} onChange={(event) => setBorrowing({ ...borrowing, dueDate: event.target.value })} />
      </label>
      <button type="submit">Create Borrowing</button>
    </form>
  );
};

export default BorrowingForm;
```

Note: This is a basic example and you should consider security and validation when creating a real-world application.