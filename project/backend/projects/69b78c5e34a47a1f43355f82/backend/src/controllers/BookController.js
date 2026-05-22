```javascript
// backend/src/controllers/BookController.js

// Import required modules
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Author = require('../models/Author');
const Genre = require('../models/Genre');
const Publisher = require('../models/Publisher');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost/bookstore', { useNewUrlParser: true, useUnifiedTopology: true });

// Define API endpoints

// Get all books
router.get('/books', async (req, res) => {
    try {
        const books = await Book.find().populate('author', 'name').populate('genre', 'name').populate('publisher', 'name');
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get book by ID
router.get('/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author', 'name').populate('genre', 'name').populate('publisher', 'name');
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
            genre: req.body.genre,
            publisher: req.body.publisher,
            publicationDate: req.body.publicationDate,
            pages: req.body.pages,
            price: req.body.price
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
        book.genre = req.body.genre;
        book.publisher = req.body.publisher;
        book.publicationDate = req.body.publicationDate;
        book.pages = req.body.pages;
        book.price = req.body.price;
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

// Get all authors
router.get('/authors', async (req, res) => {
    try {
        const authors = await Author.find();
        res.json(authors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get author by ID
router.get('/authors/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        if (!author) {
            return res.status(404).json({ message: 'Author not found' });
        }
        res.json(author);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new author
router.post('/authors', async (req, res) => {
    try {
        const author = new Author({
            name: req.body.name,
            bio: req.body.bio
        });
        await author.save();
        res.json(author);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update author
router.put('/authors/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        if (!author) {
            return res.status(404).json({ message: 'Author not found' });
        }
        author.name = req.body.name;
        author.bio = req.body.bio;
        await author.save();
        res.json(author);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete author
router.delete('/authors/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        if (!author) {
            return res.status(404).json({ message: 'Author not found' });
        }
        await author.remove();
        res.json({ message: 'Author deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all genres
router.get('/genres', async (req, res) => {
    try {
        const genres = await Genre.find();
        res.json(genres);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get genre by ID
router.get('/genres/:id', async (req, res) => {
    try {
        const genre = await Genre.findById(req.params.id);
        if (!genre) {
            return res.status(404).json({ message: 'Genre not found' });
        }
        res.json(genre);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new genre
router.post('/genres', async (req, res) => {
    try {
        const genre = new Genre({
            name: req.body.name,
            description: req.body.description
        });
        await genre.save();
        res.json(genre);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update genre
router.put('/genres/:id', async (req, res) => {
    try {
        const genre = await Genre.findById(req.params.id);
        if (!genre) {
            return res.status(404).json({ message: 'Genre not found' });
        }
        genre.name = req.body.name;
        genre.description = req.body.description;
        await genre.save();
        res.json(genre);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete genre
router.delete('/genres/:id', async (req, res) => {
    try {
        const genre = await Genre.findById(req.params.id);
        if (!genre) {
            return res.status(404).json({ message: 'Genre not found' });
        }
        await genre.remove();
        res.json({ message: 'Genre deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all publishers
router.get('/publishers', async (req, res) => {
    try {
        const publishers = await Publisher.find();
        res.json(publishers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get publisher by ID
router.get('/publishers/:id', async (req, res) => {
    try {
        const publisher = await Publisher.findById(req.params.id);
        if (!publisher) {
            return res.status(404).json({ message: 'Publisher not found' });
        }
        res.json(publisher);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new publisher
router.post('/publishers', async (req, res) => {
    try {
        const publisher = new Publisher({
            name: req.body.name,
            address: req.body.address
        });
        await publisher.save();
        res.json(publisher);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update publisher
router.put('/publishers/:id', async (req, res) => {
    try {
        const publisher = await Publisher.findById(req.params.id);
        if (!publisher) {
            return res.status(404).json({ message: 'Publisher not found' });
        }
        publisher.name = req.body.name;
        publisher.address = req.body.address;
        await publisher.save();
        res.json(publisher);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete publisher
router.delete('/publishers/:id', async (req, res) => {
    try {
        const publisher = await Publisher.findById(req.params.id);
        if (!publisher) {
            return res.status(404).json({ message: 'Publisher not found' });
        }
        await publisher.remove();
        res.json({ message: 'Publisher deleted successfully' });
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
    title: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
    genre: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre' },
    publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher' },
    publicationDate: Date,
    pages: Number,
    price: Number
});

module.exports = mongoose.model('Book', bookSchema);
```

```javascript
// backend/src/models/Author.js

const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
    name: String,
    bio: String
});

module.exports = mongoose.model('Author', authorSchema);
```

```javascript
// backend/src/models/Genre.js

const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
    name: String,
    description: String
});

module.exports = mongoose.model('Genre', genreSchema);
```

```javascript
// backend/src/models/Publisher.js

const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema({
    name: String,
    address: String
});

module.exports = mongoose.model('Publisher', publisherSchema);
```

### API Documentation

#### Books

* **GET /books**: Get all books
* **GET /books/:id**: Get book by ID
* **POST /books**: Create new book
* **PUT /books/:id**: Update book
* **DELETE /books/:id**: Delete book

#### Authors

* **GET /authors**: Get all authors
* **GET /authors/:id**: Get author by ID
* **POST /authors**: Create new author
* **PUT /authors/:id**: Update author
* **DELETE /authors/:id**: Delete author

#### Genres

* **GET /genres**: Get all genres
* **GET /genres/:id**: Get genre by ID
* **POST /genres**: Create new genre
* **PUT /genres/:id**: Update genre
* **DELETE /genres/:id**: Delete genre

#### Publishers

* **GET /publishers**: Get all publishers
* **GET /publishers/:id**: Get publisher by ID
* **POST /publishers**: Create new publisher
* **PUT /publishers/:id**: Update publisher
* **DELETE /publishers/:id**: Delete publisher

### Example Use Cases

* Get all books: `curl http://localhost:3000/books`
* Get book by ID: `curl http://localhost:3000/books/123`
* Create new book: `curl -X POST -H "Content-Type: application/json" -d '{"title": "New Book", "author": "123", "genre": "123", "publisher": "123", "publicationDate": "2022-01-01", "pages": 100, "price": 10.99}' http://localhost:3000/books`
* Update book: `curl -X PUT -H "Content-Type: application/json" -d '{"title": "Updated Book"}' http://localhost:3000/books/123`
* Delete book: `curl -X DELETE http://localhost:3000/books/123`

Note: Replace `http://localhost:3000` with your actual API endpoint.