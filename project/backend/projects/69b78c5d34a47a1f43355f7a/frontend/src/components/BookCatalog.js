```javascript
// frontend/src/components/BookCatalog.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BookCard from './BookCard';

/**
 * BookCatalog component
 * 
 * Renders a catalog of books fetched from the MongoDB database via a Core PHP API.
 * 
 * @returns {JSX.Element} The book catalog component.
 */
function BookCatalog() {
    // State to store the books data
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch books data from the API when the component mounts
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                // Make a GET request to the API to fetch books
                const response = await axios.get('/api/books');
                // Update the books state with the fetched data
                setBooks(response.data);
                // Set loading to false
                setLoading(false);
            } catch (error) {
                // Set error state if there's an error
                setError(error.message);
                // Set loading to false
                setLoading(false);
            }
        };
        // Call the fetchBooks function
        fetchBooks();
    }, []);

    // Render the book catalog
    return (
        <div className="book-catalog">
            {loading ? (
                // Render a loading message if the data is still being fetched
                <p>Loading...</p>
            ) : error ? (
                // Render an error message if there's an error
                <p>Error: {error}</p>
            ) : (
                // Render the book cards if the data is fetched successfully
                <div className="book-cards">
                    {books.map((book) => (
                        <BookCard key={book._id} book={book} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default BookCatalog;
```

```javascript
// frontend/src/components/BookCard.js

import React from 'react';

/**
 * BookCard component
 * 
 * Renders a single book card with its details.
 * 
 * @param {object} props - The component props.
 * @param {object} props.book - The book data.
 * @returns {JSX.Element} The book card component.
 */
function BookCard({ book }) {
    // Destructure the book data
    const { _id, title, author, description, price } = book;

    // Render the book card
    return (
        <div className="book-card">
            <h2>{title}</h2>
            <p>Author: {author}</p>
            <p>Description: {description}</p>
            <p>Price: ${price}</p>
            <button>Add to Cart</button>
        </div>
    );
}

export default BookCard;
```

```css
/* frontend/src/components/BookCatalog.css */

.book-catalog {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
}

.book-cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

.book-card {
    margin: 20px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 300px;
}

.book-card h2 {
    font-size: 24px;
    margin-bottom: 10px;
}

.book-card p {
    font-size: 18px;
    margin-bottom: 10px;
}

.book-card button {
    background-color: #4CAF50;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.book-card button:hover {
    background-color: #3e8e41;
}
```

```php
// backend/api/books.php

<?php

// Configuration
$mongoHost = 'mongodb://localhost:27017';
$mongoDatabase = 'bookstore';
$mongoCollection = 'books';

// Connect to MongoDB
$client = new MongoDB\Client($mongoHost);
$collection = $client->$mongoDatabase->$mongoCollection;

// Fetch all books
$books = $collection->find();

// Convert the books to an array
$booksArray = [];
foreach ($books as $book) {
    $booksArray[] = [
        '_id' => $book->_id,
        'title' => $book->title,
        'author' => $book->author,
        'description' => $book->description,
        'price' => $book->price,
    ];
}

// Send the response
header('Content-Type: application/json');
echo json_encode($booksArray);

?>
```

```javascript
// frontend/src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import BookCatalog from './components/BookCatalog';

ReactDOM.render(
    <React.StrictMode>
        <BookCatalog />
    </React.StrictMode>,
    document.getElementById('root')
);
```

```html
<!-- frontend/public/index.html -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Book Catalog</title>
    <link rel="stylesheet" href="styles.css" />
</head>
<body>
    <div id="root"></div>
    <script src="index.js"></script>
</body>
</html>
```