```javascript
// backend/src/controllers/UserController.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
        });

        // Save user to database
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
            expiresIn: '1h',
        });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login existing user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare passwords
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
            expiresIn: '1h',
        });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in user' });
    }
});

// Get user profile
router.get('/profile', async (req, res) => {
    try {
        const userId = req.user.userId;

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error getting user profile' });
    }
});

// Update user profile
router.put('/profile', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, email } = req.body;

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields
        user.name = name;
        user.email = email;

        // Save updated user
        await user.save();

        res.json({ message: 'User profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user profile' });
    }
});

// Delete user account
router.delete('/profile', async (req, res) => {
    try {
        const userId = req.user.userId;

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete user
        await user.remove();

        res.json({ message: 'User account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user account' });
    }
});

module.exports = router;
```

### API Endpoints

#### 1. Register a new user

*   **Endpoint:** `/register`
*   **Method:** `POST`
*   **Request Body:**

    ```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
```
*   **Response:**

    ```json
{
    "token": "jwt_token"
}
```

#### 2. Login existing user

*   **Endpoint:** `/login`
*   **Method:** `POST`
*   **Request Body:**

    ```json
{
    "email": "john@example.com",
    "password": "password123"
}
```
*   **Response:**

    ```json
{
    "token": "jwt_token"
}
```

#### 3. Get user profile

*   **Endpoint:** `/profile`
*   **Method:** `GET`
*   **Headers:**

    ```http
Authorization: Bearer jwt_token
```
*   **Response:**

    ```json
{
    "user": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
    }
}
```

#### 4. Update user profile

*   **Endpoint:** `/profile`
*   **Method:** `PUT`
*   **Headers:**

    ```http
Authorization: Bearer jwt_token
```
*   **Request Body:**

    ```json
{
    "name": "Jane Doe",
    "email": "jane@example.com"
}
```
*   **Response:**

    ```json
{
    "message": "User profile updated successfully"
}
```

#### 5. Delete user account

*   **Endpoint:** `/profile`
*   **Method:** `DELETE`
*   **Headers:**

    ```http
Authorization: Bearer jwt_token
```
*   **Response:**

    ```json
{
    "message": "User account deleted successfully"
}
```

### Example Use Cases

1.  **Registering a new user:**

    *   Send a `POST` request to `/register` with the user's details (name, email, password) in the request body.
    *   The server will create a new user account and return a JWT token in the response.
2.  **Logging in an existing user:**

    *   Send a `POST` request to `/login` with the user's email and password in the request body.
    *   The server will authenticate the user and return a JWT token in the response.
3.  **Getting the user's profile:**

    *   Send a `GET` request to `/profile` with the JWT token in the `Authorization` header.
    *   The server will return the user's profile details in the response.
4.  **Updating the user's profile:**

    *   Send a `PUT` request to `/profile` with the updated user details (name, email) in the request body and the JWT token in the `Authorization` header.
    *   The server will update the user's profile and return a success message in the response.
5.  **Deleting the user's account:**

    *   Send a `DELETE` request to `/profile` with the JWT token in the `Authorization` header.
    *   The server will delete the user's account and return a success message in the response.