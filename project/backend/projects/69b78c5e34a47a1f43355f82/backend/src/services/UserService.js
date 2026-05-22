```javascript
// backend/src/services/UserService.js

/**
 * Provides user account management services.
 * 
 * @class UserService
 */
class UserService {
  /**
   * Creates an instance of UserService.
   * 
   * @param {Object} db - MongoDB database connection
   * @param {Object} bcrypt - bcrypt library for password hashing
   * @param {Object} jwt - jsonwebtoken library for token generation
   */
  constructor(db, bcrypt, jwt) {
    this.db = db;
    this.bcrypt = bcrypt;
    this.jwt = jwt;
  }

  /**
   * Registers a new user.
   * 
   * @param {Object} userData - User data to register
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email
   * @param {string} userData.password - Password
   * @returns {Promise<Object>} Registered user data
   */
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await this.db.collection('users').findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await this.bcrypt.hash(userData.password, 10);

      // Create new user
      const user = {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
      };

      // Insert user into database
      const result = await this.db.collection('users').insertOne(user);
      return result.ops[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logs in a user.
   * 
   * @param {Object} loginData - Login data
   * @param {string} loginData.email - Email
   * @param {string} loginData.password - Password
   * @returns {Promise<Object>} Login result
   */
  async login(loginData) {
    try {
      // Find user by email
      const user = await this.db.collection('users').findOne({ email: loginData.email });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Compare passwords
      const isValidPassword = await this.bcrypt.compare(loginData.password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = this.jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });

      return { token, user };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates a user's profile.
   * 
   * @param {Object} userId - User ID
   * @param {Object} updateData - Update data
   * @param {string} updateData.username - Username
   * @param {string} updateData.email - Email
   * @returns {Promise<Object>} Updated user data
   */
  async updateProfile(userId, updateData) {
    try {
      // Find user by ID
      const user = await this.db.collection('users').findOne({ _id: userId });
      if (!user) {
        throw new Error('User not found');
      }

      // Update user data
      const updatedUser = await this.db.collection('users').updateOne({ _id: userId }, { $set: updateData });
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deletes a user account.
   * 
   * @param {Object} userId - User ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteAccount(userId) {
    try {
      // Find user by ID
      const user = await this.db.collection('users').findOne({ _id: userId });
      if (!user) {
        throw new Error('User not found');
      }

      // Delete user
      const result = await this.db.collection('users').deleteOne({ _id: userId });
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;
```

### Example Usage

```javascript
// backend/src/controllers/UserController.js

const UserService = require('../services/UserService');
const db = require('../db'); // MongoDB database connection
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userService = new UserService(db, bcrypt, jwt);

// Register a new user
const registerUser = async (req, res) => {
  try {
    const userData = req.body;
    const registeredUser = await userService.register(userData);
    res.json(registeredUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login a user
const loginUser = async (req, res) => {
  try {
    const loginData = req.body;
    const loginResult = await userService.login(loginData);
    res.json(loginResult);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a user's profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const updateData = req.body;
    const updatedUser = await userService.updateProfile(userId, updateData);
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a user account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.params.userId;
    const deletionResult = await userService.deleteAccount(userId);
    res.json(deletionResult);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, updateProfile, deleteAccount };
```

### API Endpoints

* **POST /register**: Register a new user
* **POST /login**: Login a user
* **PATCH /users/:userId**: Update a user's profile
* **DELETE /users/:userId**: Delete a user account

### Request/Response Examples

* **Register a new user**
  + Request: `POST /register` with JSON body `{ "username": "johnDoe", "email": "johndoe@example.com", "password": "password123" }`
  + Response: `201 Created` with JSON body `{ "_id": "...", "username": "johnDoe", "email": "johndoe@example.com" }`
* **Login a user**
  + Request: `POST /login` with JSON body `{ "email": "johndoe@example.com", "password": "password123" }`
  + Response: `200 OK` with JSON body `{ "token": "...", "user": { "_id": "...", "username": "johnDoe", "email": "johndoe@example.com" } }`
* **Update a user's profile**
  + Request: `PATCH /users/:userId` with JSON body `{ "username": "janeDoe" }`
  + Response: `200 OK` with JSON body `{ "_id": "...", "username": "janeDoe", "email": "johndoe@example.com" }`
* **Delete a user account**
  + Request: `DELETE /users/:userId`
  + Response: `200 OK` with JSON body `{ "message": "User deleted successfully" }`