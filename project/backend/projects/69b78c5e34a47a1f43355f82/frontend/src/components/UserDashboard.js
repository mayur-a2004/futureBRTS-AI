```javascript
// frontend/src/components/UserDashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './UserDashboard.css';

function UserDashboard() {
    const [user, setUser] = useState({});
    const [borrowingHistory, setBorrowingHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch user data and borrowing history from API
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('/api/user');
                setUser(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchBorrowingHistory = async () => {
            try {
                const response = await axios.get('/api/borrowing-history');
                setBorrowingHistory(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchUserData();
        fetchBorrowingHistory();
        setLoading(false);
    }, []);

    // Render user dashboard
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="user-dashboard">
            <h1>Welcome, {user.name}!</h1>
            <section className="account-info">
                <h2>Account Information</h2>
                <p>Email: {user.email}</p>
                <p>Phone Number: {user.phoneNumber}</p>
                <p>Address: {user.address}</p>
                <Link to="/edit-profile">Edit Profile</Link>
            </section>
            <section className="borrowing-history">
                <h2>Borrowing History</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Item</th>
                            <th>Return Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {borrowingHistory.map((item, index) => (
                            <tr key={index}>
                                <td>{item.date}</td>
                                <td>{item.item}</td>
                                <td>{item.returnDate}</td>
                                <td>{item.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export default UserDashboard;
```

```css
/* frontend/src/components/UserDashboard.css */

.user-dashboard {
    max-width: 800px;
    margin: 40px auto;
    padding: 20px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.account-info {
    margin-bottom: 20px;
}

.account-info h2 {
    margin-top: 0;
}

.account-info p {
    margin-bottom: 10px;
}

.account-info a {
    display: block;
    margin-top: 10px;
    padding: 10px;
    background-color: #4CAF50;
    color: #fff;
    text-decoration: none;
    border-radius: 5px;
}

.borrowing-history {
    margin-bottom: 20px;
}

.borrowing-history h2 {
    margin-top: 0;
}

.borrowing-history table {
    width: 100%;
    border-collapse: collapse;
}

.borrowing-history th, .borrowing-history td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
}

.borrowing-history th {
    background-color: #f0f0f0;
}
```

```php
// backend/api/user.php

<?php
require_once 'database.php';

function getUserData() {
    $db = new Database();
    $query = "SELECT * FROM users WHERE id = 1";
    $result = $db->query($query);
    $user = $result->fetch_assoc();
    return $user;
}

function getBorrowingHistory() {
    $db = new Database();
    $query = "SELECT * FROM borrowing_history";
    $result = $db->query($query);
    $borrowingHistory = array();
    while ($row = $result->fetch_assoc()) {
        $borrowingHistory[] = $row;
    }
    return $borrowingHistory;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['user'])) {
        $user = getUserData();
        echo json_encode($user);
    } elseif (isset($_GET['borrowing-history'])) {
        $borrowingHistory = getBorrowingHistory();
        echo json_encode($borrowingHistory);
    }
}
```

```php
// backend/api/Database.php

<?php
class Database {
    private $host;
    private $username;
    private $password;
    private $database;

    public function __construct() {
        $this->host = 'localhost';
        $this->username = 'root';
        $this->password = '';
        $this->database = 'mydatabase';
    }

    public function connect() {
        $conn = new mysqli($this->host, $this->username, $this->password, $this->database);
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }
        return $conn;
    }

    public function query($query) {
        $conn = $this->connect();
        $result = $conn->query($query);
        $conn->close();
        return $result;
    }
}
```

```javascript
// frontend/src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import UserDashboard from './components/UserDashboard';

ReactDOM.render(
    <React.StrictMode>
        <UserDashboard />
    </React.StrictMode>,
    document.getElementById('root')
);
```

```html
<!-- frontend/public/index.html -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Dashboard</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="root"></div>
    <script src="index.js"></script>
</body>
</html>
```

This code provides a basic user dashboard with account information and borrowing history. The frontend is built using React, and the backend is built using PHP and MongoDB. The user data and borrowing history are fetched from the backend API and displayed on the frontend.

To run the application, follow these steps:

1. Install the required dependencies: `npm install`
2. Start the frontend development server: `npm start`
3. Start the backend server: `php -S localhost:8000`
4. Open the application in your web browser: `http://localhost:3000`

Note: This is a basic example and may require additional configuration and security measures for a production-ready application.