```javascript
// backend/src/controllers/UserController.js

// Import required modules
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create a new user
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        });

        // Save the user to the database
        await user.save();

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
            expiresIn: '1h',
        });

        // Return the user and token
        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login an existing user
router.post('/login', async (req, res) => {
    try {
        // Find the user by email
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the passwords
        const isValidPassword = await bcrypt.compare(req.body.password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
            expiresIn: '1h',
        });

        // Return the user and token
        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in user' });
    }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        // Find all users
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error getting users' });
    }
});

// Get a user by ID
router.get('/users/:id', async (req, res) => {
    try {
        // Find the user by ID
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error getting user' });
    }
});

// Update a user
router.put('/users/:id', async (req, res) => {
    try {
        // Find the user by ID
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user
        user.name = req.body.name;
        user.email = req.body.email;
        await user.save();

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
    try {
        // Find the user by ID
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete the user
        await user.remove();

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

module.exports = router;
```

### Explanation

This code defines a `UserController` class that handles user management operations. It provides methods for registering a new user, logging in an existing user, getting all users, getting a user by ID, updating a user, and deleting a user.

The `register` method checks if a user with the same email already exists, hashes the password, and creates a new user. The `login` method finds the user by email, compares the passwords, and generates a JWT token. The `getUsers` method finds all users, and the `getUser` method finds a user by ID. The `updateUser` method updates a user, and the `deleteUser` method deletes a user.

The code uses the `bcrypt` library to hash and compare passwords, and the `jsonwebtoken` library to generate JWT tokens. It also uses the `express` framework to handle HTTP requests and responses.

### Example Use Cases

* Register a new user: `POST /register` with a JSON body containing `name`, `email`, and `password`.
* Login an existing user: `POST /login` with a JSON body containing `email` and `password`.
* Get all users: `GET /users`.
* Get a user by ID: `GET /users/:id`.
* Update a user: `PUT /users/:id` with a JSON body containing `name` and `email`.
* Delete a user: `DELETE /users/:id`.

### API Documentation

#### Register a new user

* **URL**: `/register`
* **Method**: `POST`
* **Request Body**: `name`, `email`, `password`
* **Response**: `user`, `token`

#### Login an existing user

* **URL**: `/login`
* **Method**: `POST`
* **Request Body**: `email`, `password`
* **Response**: `user`, `token`

#### Get all users

* **URL**: `/users`
* **Method**: `GET`
* **Response**: `users`

#### Get a user by ID

* **URL**: `/users/:id`
* **Method**: `GET`
* **Response**: `user`

#### Update a user

* **URL**: `/users/:id`
* **Method**: `PUT`
* **Request Body**: `name`, `email`
* **Response**: `user`

#### Delete a user

* **URL**: `/users/:id`
* **Method**: `DELETE`
* **Response**: `message`