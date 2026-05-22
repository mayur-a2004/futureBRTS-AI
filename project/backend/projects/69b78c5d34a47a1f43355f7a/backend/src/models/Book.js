```javascript
// backend/src/models/Book.js

// Import required modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Book schema
const bookSchema = new Schema({
  /**
   * Book title
   * @type {String}
   * @required
   */
  title: {
    type: String,
    required: true,
    trim: true,
  },

  /**
   * Book author
   * @type {String}
   * @required
   */
  author: {
    type: String,
    required: true,
    trim: true,
  },

  /**
   * Book publication date
   * @type {Date}
   * @required
   */
  publicationDate: {
    type: Date,
    required: true,
  },

  /**
   * Book genre
   * @type {String}
   * @required
   */
  genre: {
    type: String,
    required: true,
    trim: true,
  },

  /**
   * Book description
   * @type {String}
   */
  description: {
    type: String,
    trim: true,
  },

  /**
   * Book ISBN
   * @type {String}
   * @required
   */
  isbn: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  /**
   * Book price
   * @type {Number}
   * @required
   */
  price: {
    type: Number,
    required: true,
  },

  /**
   * Book rating (1-5)
   * @type {Number}
   */
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },

  /**
   * Book reviews
   * @type {Array}
   */
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
});

// Create the Book model
const Book = mongoose.model('Book', bookSchema);

// Export the Book model
module.exports = Book;
```

### Example Usage

```javascript
// Create a new book
const newBook = new Book({
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  publicationDate: new Date('1925-04-10'),
  genre: 'Classic',
  description: 'Set in the jazz age on Long Island, the novel is narrated by Nick Carraway, a young man from the Midwest who moves to Long Island\'s West Egg to work in the bond business.',
  isbn: '9780743273565',
  price: 15.99,
});

// Save the book to the database
newBook.save((err, book) => {
  if (err) {
    console.error(err);
  } else {
    console.log(book);
  }
});

// Find all books
Book.find()
  .then((books) => {
    console.log(books);
  })
  .catch((err) => {
    console.error(err);
  });

// Find a book by ISBN
Book.findOne({ isbn: '9780743273565' })
  .then((book) => {
    console.log(book);
  })
  .catch((err) => {
    console.error(err);
  });

// Update a book
Book.findByIdAndUpdate(
  'bookId',
  {
    $set: {
      title: 'The Great Gatsby (Updated)',
    },
  },
  { new: true }
)
  .then((book) => {
    console.log(book);
  })
  .catch((err) => {
    console.error(err);
  });

// Delete a book
Book.findByIdAndRemove('bookId')
  .then((book) => {
    console.log(book);
  })
  .catch((err) => {
    console.error(err);
  });
```

### API Endpoints

#### Create Book

*   **URL:** `/books`
*   **Method:** `POST`
*   **Request Body:**

    ```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "publicationDate": "1925-04-10",
  "genre": "Classic",
  "description": "Set in the jazz age on Long Island, the novel is narrated by Nick Carraway, a young man from the Midwest who moves to Long Island's West Egg to work in the bond business.",
  "isbn": "9780743273565",
  "price": 15.99
}
```

#### Get All Books

*   **URL:** `/books`
*   **Method:** `GET`

#### Get Book by ISBN

*   **URL:** `/books/:isbn`
*   **Method:** `GET`

#### Update Book

*   **URL:** `/books/:id`
*   **Method:** `PATCH`
*   **Request Body:**

    ```json
{
  "title": "The Great Gatsby (Updated)"
}
```

#### Delete Book

*   **URL:** `/books/:id`
*   **Method:** `DELETE`