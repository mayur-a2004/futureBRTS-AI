```javascript
// frontend/src/components/AdminDashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// MongoDB connection
const mongoDBUrl = 'mongodb://localhost:27017/library';

// Function to get all books
const getBooks = async () => {
    try {
        const response = await axios.get('/api/books');
        return response.data;
    } catch (error) {
        console.error(error);
    }
};

// Function to get all users
const getUsers = async () => {
    try {
        const response = await axios.get('/api/users');
        return response.data;
    } catch (error) {
        console.error(error);
    }
};

// Function to get all borrowed books
const getBorrowedBooks = async () => {
    try {
        const response = await axios.get('/api/borrowed-books');
        return response.data;
    } catch (error) {
        console.error(error);
    }
};

const AdminDashboard = () => {
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [borrowedBooks, setBorrowedBooks] = useState([]);

    useEffect(() => {
        const fetchBooks = async () => {
            const booksData = await getBooks();
            setBooks(booksData);
        };

        const fetchUsers = async () => {
            const usersData = await getUsers();
            setUsers(usersData);
        };

        const fetchBorrowedBooks = async () => {
            const borrowedBooksData = await getBorrowedBooks();
            setBorrowedBooks(borrowedBooksData);
        };

        fetchBooks();
        fetchUsers();
        fetchBorrowedBooks();
    }, []);

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <div className="dashboard-sections">
                <section className="books-section">
                    <h2>Books</h2>
                    <ul>
                        {books.map((book) => (
                            <li key={book._id}>
                                <Link to={`/books/${book._id}`}>{book.title}</Link>
                            </li>
                        ))}
                    </ul>
                </section>
                <section className="users-section">
                    <h2>Users</h2>
                    <ul>
                        {users.map((user) => (
                            <li key={user._id}>
                                <Link to={`/users/${user._id}`}>{user.name}</Link>
                            </li>
                        ))}
                    </ul>
                </section>
                <section className="borrowed-books-section">
                    <h2>Borrowed Books</h2>
                    <ul>
                        {borrowedBooks.map((borrowedBook) => (
                            <li key={borrowedBook._id}>
                                <Link to={`/borrowed-books/${borrowedBook._id}`}>
                                    {borrowedBook.book.title} (Borrowed by {borrowedBook.user.name})
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
```

**Server-side code (Core PHP)**
```php
// api/books.php

require_once 'db.php';

$books = array();

$query = "SELECT * FROM books";
$result = mysqli_query($conn, $query);

while ($row = mysqli_fetch_assoc($result)) {
    $books[] = $row;
}

echo json_encode($books);

// api/users.php

require_once 'db.php';

$users = array();

$query = "SELECT * FROM users";
$result = mysqli_query($conn, $query);

while ($row = mysqli_fetch_assoc($result)) {
    $users[] = $row;
}

echo json_encode($users);

// api/borrowed-books.php

require_once 'db.php';

$borrowedBooks = array();

$query = "SELECT * FROM borrowed_books";
$result = mysqli_query($conn, $query);

while ($row = mysqli_fetch_assoc($result)) {
    $borrowedBooks[] = $row;
}

echo json_encode($borrowedBooks);
```

**Database schema (MongoDB)**
```javascript
// books collection
{
    "_id" : ObjectId,
    "title" : String,
    "author" : String,
    "publishedDate" : Date
}

// users collection
{
    "_id" : ObjectId,
    "name" : String,
    "email" : String,
    "password" : String
}

// borrowed_books collection
{
    "_id" : ObjectId,
    "bookId" : ObjectId,
    "userId" : ObjectId,
    "borrowDate" : Date,
    "returnDate" : Date
}
```
This code provides a basic admin dashboard for managing library operations. It includes sections for books, users, and borrowed books. The dashboard fetches data from the MongoDB database using Core PHP API endpoints. The frontend is built using React and uses Axios for making API requests. The database schema is designed to store information about books, users, and borrowed books.