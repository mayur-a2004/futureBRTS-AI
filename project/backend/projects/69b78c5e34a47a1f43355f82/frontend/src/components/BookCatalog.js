```javascript
// frontend/src/components/BookCatalog.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// CSS styles for the component
import './BookCatalog.css';

// Function to display the book catalog
function BookCatalog() {
    // State variables to store the book data and search/filter inputs
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGenre, setFilterGenre] = useState('');
    const [filterAuthor, setFilterAuthor] = useState('');

    // API endpoint URL to fetch book data from the MongoDB database
    const apiUrl = 'http://localhost:8080/api/books';

    // Fetch book data from the API endpoint when the component mounts
    useEffect(() => {
        axios.get(apiUrl)
            .then(response => {
                setBooks(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    // Handle search input changes
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Handle filter genre changes
    const handleFilterGenreChange = (event) => {
        setFilterGenre(event.target.value);
    };

    // Handle filter author changes
    const handleFilterAuthorChange = (event) => {
        setFilterAuthor(event.target.value);
    };

    // Filter the book data based on search and filter inputs
    const filteredBooks = books.filter((book) => {
        const searchRegex = new RegExp(searchTerm, 'i');
        const genreRegex = new RegExp(filterGenre, 'i');
        const authorRegex = new RegExp(filterAuthor, 'i');

        return (
            searchRegex.test(book.title) ||
            searchRegex.test(book.description) ||
            searchRegex.test(book.author) ||
            searchRegex.test(book.genre)
        ) &&
        (filterGenre === '' || genreRegex.test(book.genre)) &&
        (filterAuthor === '' || authorRegex.test(book.author));
    });

    // Render the book catalog
    return (
        <div className="book-catalog">
            <h1>Book Catalog</h1>
            <div className="search-filter">
                <input
                    type="text"
                    placeholder="Search books"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <select value={filterGenre} onChange={handleFilterGenreChange}>
                    <option value="">All genres</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-fiction">Non-fiction</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Thriller">Thriller</option>
                </select>
                <select value={filterAuthor} onChange={handleFilterAuthorChange}>
                    <option value="">All authors</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Jane Doe">Jane Doe</option>
                    <option value="Bob Smith">Bob Smith</option>
                </select>
            </div>
            <ul className="book-list">
                {filteredBooks.map((book) => (
                    <li key={book._id}>
                        <h2>{book.title}</h2>
                        <p>Author: {book.author}</p>
                        <p>Genre: {book.genre}</p>
                        <p>Description: {book.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default BookCatalog;
```

```css
/* frontend/src/components/BookCatalog.css */

.book-catalog {
    max-width: 800px;
    margin: 40px auto;
    padding: 20px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.search-filter {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-bottom: 20px;
}

.search-filter input[type="text"] {
    width: 50%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
}

.search-filter select {
    width: 20%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
}

.book-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.book-list li {
    margin-bottom: 20px;
    padding: 20px;
    border-bottom: 1px solid #ccc;
}

.book-list li:last-child {
    border-bottom: none;
}

.book-list h2 {
    font-size: 18px;
    margin-bottom: 10px;
}

.book-list p {
    font-size: 16px;
    margin-bottom: 10px;
}
```

```php
// backend/api/books.php

<?php

// Connect to the MongoDB database
$mongoClient = new MongoDB\Client("mongodb://localhost:27017");
$db = $mongoClient->bookstore;
$collection = $db->books;

// Fetch all books from the database
$books = $collection->find();

// Convert the MongoDB cursor to a PHP array
$booksArray = iterator_to_array($books);

// Send the book data as a JSON response
header('Content-Type: application/json');
echo json_encode($booksArray);

?>
```

```json
// sample book data in the MongoDB database

[
    {
        "_id": "1",
        "title": "Book 1",
        "author": "John Doe",
        "genre": "Fiction",
        "description": "This is a sample book."
    },
    {
        "_id": "2",
        "title": "Book 2",
        "author": "Jane Doe",
        "genre": "Non-fiction",
        "description": "This is another sample book."
    },
    {
        "_id": "3",
        "title": "Book 3",
        "author": "Bob Smith",
        "genre": "Mystery",
        "description": "This is a mystery book."
    }
]
```

This code creates a book catalog component that displays a list of books and allows users to search and filter the books by genre and author. The book data is fetched from a MongoDB database using a PHP API endpoint. The component uses React for the frontend and MongoDB for the database. The search and filter functionality is implemented using JavaScript and CSS.