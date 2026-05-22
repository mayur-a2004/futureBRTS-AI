```javascript
// backend/src/controllers/BorrowingController.js

const Borrowing = require('../models/Borrowing');
const Book = require('../models/Book');
const User = require('../models/User');
const { ObjectId } = require('mongodb');

/**
 * Handles book borrowing and returning operations
 */
class BorrowingController {
  /**
   * Borrow a book
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async borrowBook(req, res) {
    try {
      const { bookId, userId } = req.body;
      const book = await Book.findById(bookId);
      const user = await User.findById(userId);

      if (!book || !user) {
        return res.status(404).json({ message: 'Book or user not found' });
      }

      if (book.isBorrowed) {
        return res.status(400).json({ message: 'Book is already borrowed' });
      }

      const borrowing = new Borrowing({
        book: bookId,
        user: userId,
        borrowDate: new Date(),
        returnDate: null,
      });

      await borrowing.save();
      book.isBorrowed = true;
      await book.save();

      return res.json({ message: 'Book borrowed successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Return a book
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async returnBook(req, res) {
    try {
      const { bookId, userId } = req.body;
      const book = await Book.findById(bookId);
      const user = await User.findById(userId);
      const borrowing = await Borrowing.findOne({ book: bookId, user: userId, returnDate: null });

      if (!book || !user || !borrowing) {
        return res.status(404).json({ message: 'Book, user or borrowing not found' });
      }

      borrowing.returnDate = new Date();
      await borrowing.save();
      book.isBorrowed = false;
      await book.save();

      return res.json({ message: 'Book returned successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get all borrowings
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAllBorrowings(req, res) {
    try {
      const borrowings = await Borrowing.find().populate('book').populate('user');
      return res.json(borrowings);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get borrowings by user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getBorrowingsByUser(req, res) {
    try {
      const userId = req.params.userId;
      const borrowings = await Borrowing.find({ user: userId }).populate('book');
      return res.json(borrowings);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get borrowings by book
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getBorrowingsByBook(req, res) {
    try {
      const bookId = req.params.bookId;
      const borrowings = await Borrowing.find({ book: bookId }).populate('user');
      return res.json(borrowings);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = BorrowingController;
```

### API Endpoints

#### Borrow a Book
* **URL:** `/borrowings`
* **Method:** `POST`
* **Request Body:** `{ bookId: string, userId: string }`
* **Response:** `{ message: string }`

#### Return a Book
* **URL:** `/borrowings/return`
* **Method:** `POST`
* **Request Body:** `{ bookId: string, userId: string }`
* **Response:** `{ message: string }`

#### Get All Borrowings
* **URL:** `/borrowings`
* **Method:** `GET`
* **Response:** `[Borrowing]`

#### Get Borrowings by User
* **URL:** `/borrowings/users/:userId`
* **Method:** `GET`
* **Response:** `[Borrowing]`

#### Get Borrowings by Book
* **URL:** `/borrowings/books/:bookId`
* **Method:** `GET`
* **Response:** `[Borrowing]`

### Example Use Cases

* Borrow a book: `curl -X POST -H "Content-Type: application/json" -d '{"bookId": "123", "userId": "456"}' http://localhost:3000/borrowings`
* Return a book: `curl -X POST -H "Content-Type: application/json" -d '{"bookId": "123", "userId": "456"}' http://localhost:3000/borrowings/return`
* Get all borrowings: `curl -X GET http://localhost:3000/borrowings`
* Get borrowings by user: `curl -X GET http://localhost:3000/borrowings/users/456`
* Get borrowings by book: `curl -X GET http://localhost:3000/borrowings/books/123`