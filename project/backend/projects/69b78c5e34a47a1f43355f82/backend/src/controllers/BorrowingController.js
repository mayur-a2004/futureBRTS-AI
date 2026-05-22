```javascript
// backend/src/controllers/BorrowingController.js

const Borrowing = require('../models/Borrowing');
const Book = require('../models/Book');
const User = require('../models/User');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Create a new borrowing
async function createBorrowing(req, res) {
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
            bookId,
            userId,
            borrowingDate: new Date(),
            returnDate: null,
            status: 'borrowed'
        });

        await borrowing.save();
        book.isBorrowed = true;
        await book.save();

        return res.status(201).json({ message: 'Borrowing created successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Get all borrowings
async function getAllBorrowings(req, res) {
    try {
        const borrowings = await Borrowing.find().populate('bookId', 'title author').populate('userId', 'name email');
        return res.status(200).json(borrowings);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Get borrowing by id
async function getBorrowingById(req, res) {
    try {
        const id = req.params.id;
        const borrowing = await Borrowing.findById(id).populate('bookId', 'title author').populate('userId', 'name email');
        if (!borrowing) {
            return res.status(404).json({ message: 'Borrowing not found' });
        }
        return res.status(200).json(borrowing);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Update borrowing status
async function updateBorrowingStatus(req, res) {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const borrowing = await Borrowing.findById(id);
        if (!borrowing) {
            return res.status(404).json({ message: 'Borrowing not found' });
        }
        borrowing.status = status;
        if (status === 'returned') {
            borrowing.returnDate = new Date();
            const book = await Book.findById(borrowing.bookId);
            book.isBorrowed = false;
            await book.save();
        }
        await borrowing.save();
        return res.status(200).json({ message: 'Borrowing status updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Delete borrowing
async function deleteBorrowing(req, res) {
    try {
        const id = req.params.id;
        const borrowing = await Borrowing.findByIdAndDelete(id);
        if (!borrowing) {
            return res.status(404).json({ message: 'Borrowing not found' });
        }
        return res.status(200).json({ message: 'Borrowing deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    createBorrowing,
    getAllBorrowings,
    getBorrowingById,
    updateBorrowingStatus,
    deleteBorrowing
};
```

### API Endpoints

#### 1. Create a new borrowing

*   **Endpoint:** `/borrowings`
*   **Method:** `POST`
*   **Request Body:** `{ bookId: string, userId: string }`
*   **Response:** `{ message: string }`

#### 2. Get all borrowings

*   **Endpoint:** `/borrowings`
*   **Method:** `GET`
*   **Response:** `[Borrowing]`

#### 3. Get borrowing by id

*   **Endpoint:** `/borrowings/:id`
*   **Method:** `GET`
*   **Response:** `Borrowing`

#### 4. Update borrowing status

*   **Endpoint:** `/borrowings/:id`
*   **Method:** `PATCH`
*   **Request Body:** `{ status: string }`
*   **Response:** `{ message: string }`

#### 5. Delete borrowing

*   **Endpoint:** `/borrowings/:id`
*   **Method:** `DELETE`
*   **Response:** `{ message: string }`

### Example Use Cases

*   Create a new borrowing: `curl -X POST -H "Content-Type: application/json" -d '{"bookId": "book1", "userId": "user1"}' http://localhost:3000/borrowings`
*   Get all borrowings: `curl -X GET http://localhost:3000/borrowings`
*   Get borrowing by id: `curl -X GET http://localhost:3000/borrowings/borrowing1`
*   Update borrowing status: `curl -X PATCH -H "Content-Type: application/json" -d '{"status": "returned"}' http://localhost:3000/borrowings/borrowing1`
*   Delete borrowing: `curl -X DELETE http://localhost:3000/borrowings/borrowing1`