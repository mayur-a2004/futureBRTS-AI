```javascript
// backend/src/models/User.js

// Import required modules
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Define the user schema
const userSchema = new mongoose.Schema({
    /**
     * Unique username chosen by the user
     */
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    /**
     * Email address of the user
     */
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    /**
     * Password for the user's account
     */
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8
    },
    /**
     * User's first name
     */
    firstName: {
        type: String,
        trim: true
    },
    /**
     * User's last name
     */
    lastName: {
        type: String,
        trim: true
    },
    /**
     * User's role (e.g., admin, moderator, user)
     */
    role: {
        type: String,
        enum: ['admin', 'moderator', 'user'],
        default: 'user'
    },
    /**
     * Timestamp for when the user's account was created
     */
    createdAt: {
        type: Date,
        default: Date.now
    },
    /**
     * Timestamp for when the user's account was last updated
     */
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    /**
     * Enable timestamps for the user schema
     */
    timestamps: true
});

// Pre-save hook to hash the user's password
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to generate a JSON Web Token (JWT) for the user
userSchema.methods.generateToken = function() {
    const token = jwt.sign({
        id: this._id,
        username: this.username,
        email: this.email,
        role: this.role
    }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });
    return token;
};

// Method to compare a provided password with the user's hashed password
userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Create the User model
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;
```

### Example Usage:

```javascript
// backend/src/controllers/authController.js

// Import required modules
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new user
        const user = new User({ username, email, password, firstName, lastName });
        await user.save();

        // Generate a JWT token for the user
        const token = user.generateToken();

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Login an existing user
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare the provided password with the user's hashed password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate a JWT token for the user
        const token = user.generateToken();

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
```

### API Endpoints:

*   **POST /api/auth/register**: Register a new user
*   **POST /api/auth/login**: Login an existing user

### Request Body:

*   **username**: Unique username chosen by the user
*   **email**: Email address of the user
*   **password**: Password for the user's account
*   **firstName**: User's first name
*   **lastName**: User's last name

### Response:

*   **token**: JSON Web Token (JWT) for the user

### Error Handling:

*   **400 Bad Request**: User already exists or invalid request body
*   **401 Unauthorized**: Invalid email or password
*   **500 Internal Server Error**: Server-side error occurred