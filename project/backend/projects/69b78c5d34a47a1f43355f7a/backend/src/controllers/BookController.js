```javascript
// backend/src/controllers/BookController.js

const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/book_catalog', { useNewUrlParser: true, useUnifiedTopology: true });

// Get all books
router.get('/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get book by ID
router.get('/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new book
router.post('/books', async (req, res) => {
    try {
        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            publicationDate: req.body.publicationDate,
            genre: req.body.genre,
            description: req.body.description
        });
        await book.save();
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update book
router.put('/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        book.title = req.body.title;
        book.author = req.body.author;
        book.publicationDate = req.body.publicationDate;
        book.genre = req.body.genre;
        book.description = req.body.description;
        await book.save();
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete book
router.delete('/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        await book.remove();
        res.json({ message: 'Book deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search books by title or author
router.get('/search', async (req, res) => {
    try {
        const query = req.query.query;
        const books = await Book.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get books by genre
router.get('/genre/:genre', async (req, res) => {
    try {
        const genre = req.params.genre;
        const books = await Book.find({ genre: genre });
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get books by publication date range
router.get('/publication-date', async (req, res) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const books = await Book.find({
            publicationDate: {
                $gte: startDate,
                $lte: endDate
            }
        });
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
```

```javascript
// backend/src/models/Book.js

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    publicationDate: {
        type: Date,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Book', bookSchema);
```

```javascript
// frontend/index.html

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Book Catalog</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Book Catalog</h1>
    <div id="book-list"></div>
    <script src="script.js"></script>
</body>
</html>
```

```javascript
// frontend/script.js

const bookList = document.getElementById('book-list');

// Get all books
fetch('/books')
    .then(response => response.json())
    .then(books => {
        books.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.innerHTML = `
                <h2>${book.title}</h2>
                <p>Author: ${book.author}</p>
                <p>Publication Date: ${book.publicationDate}</p>
                <p>Genre: ${book.genre}</p>
                <p>Description: ${book.description}</p>
            `;
            bookList.appendChild(bookElement);
        });
    })
    .catch(error => console.error(error));

// Search books
const searchForm = document.createElement('form');
searchForm.innerHTML = `
    <input type="text" id="search-input" placeholder="Search books">
    <button type="submit">Search</button>
`;
document.body.appendChild(searchForm);

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const query = document.getElementById('search-input').value;
    fetch(`/search?query=${query}`)
        .then(response => response.json())
        .then(books => {
            bookList.innerHTML = '';
            books.forEach(book => {
                const bookElement = document.createElement('div');
                bookElement.innerHTML = `
                    <h2>${book.title}</h2>
                    <p>Author: ${book.author}</p>
                    <p>Publication Date: ${book.publicationDate}</p>
                    <p>Genre: ${book.genre}</p>
                    <p>Description: ${book.description}</p>
                `;
                bookList.appendChild(bookElement);
            });
        })
        .catch(error => console.error(error));
});
```

```css
/* frontend/styles.css */

body {
    font-family: Arial, sans-serif;
}

#book-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

#book-list div {
    margin: 20px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

#book-list h2 {
    font-size: 24px;
    margin-bottom: 10px;
}

#book-list p {
    font-size: 18px;
    margin-bottom: 10px;
}
```