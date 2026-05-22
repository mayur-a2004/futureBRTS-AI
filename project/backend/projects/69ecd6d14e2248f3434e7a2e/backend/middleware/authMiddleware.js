/* 
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const db = require('../config/db');

// Middleware for authentication and authorization
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.sendStatus(403); // Forbidden
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }

        req.user = user; // Attach user to request
        next(); // Pass control to the next handler
    });
};

// Function to register a new user
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // Implement user registration logic
    try {
        const newUser = await User.create({ username, email, password });
        res.status(201).json({ id: newUser.id, username: newUser.username });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
};

// Function to log in a user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Implement user login logic
    try {
        const user = await User.findOne({ where: { email } });
        if (!user || user.password !== password) {
            return res.sendStatus(401); // Unauthorized
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in' });
    }
};

// Function to check if the user is an admin (example of authorization)
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.sendStatus(403); // Forbidden
    }
    next();
};

// Export the middleware and functions
module.exports = { authenticateJWT, registerUser, loginUser, isAdmin };
*/