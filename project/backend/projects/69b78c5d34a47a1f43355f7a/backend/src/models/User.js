```javascript
// backend/src/models/User.js

/**
 * Represents a user entity.
 * 
 * @class User
 */
class User {
    /**
     * Creates an instance of User.
     * 
     * @param {string} id - Unique identifier for the user.
     * @param {string} name - Name of the user.
     * @param {string} email - Email address of the user.
     * @param {string} password - Password for the user.
     * @param {string} role - Role of the user (e.g., admin, moderator, user).
     */
    constructor(id, name, email, password, role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    /**
     * Saves the user to the database.
     * 
     * @returns {Promise} Promise that resolves when the user is saved.
     */
    async save() {
        // Import the MongoDB model
        const mongoose = require('mongoose');
        const UserSchema = new mongoose.Schema({
            id: String,
            name: String,
            email: String,
            password: String,
            role: String
        });
        const UserModel = mongoose.model('User', UserSchema);

        // Create a new user document
        const user = new UserModel({
            id: this.id,
            name: this.name,
            email: this.email,
            password: this.password,
            role: this.role
        });

        // Save the user to the database
        return user.save();
    }

    /**
     * Updates the user in the database.
     * 
     * @param {object} updates - Object containing the updated fields.
     * @returns {Promise} Promise that resolves when the user is updated.
     */
    async update(updates) {
        // Import the MongoDB model
        const mongoose = require('mongoose');
        const UserSchema = new mongoose.Schema({
            id: String,
            name: String,
            email: String,
            password: String,
            role: String
        });
        const UserModel = mongoose.model('User', UserSchema);

        // Find the user by ID and update it
        return UserModel.findByIdAndUpdate(this.id, updates, { new: true });
    }

    /**
     * Deletes the user from the database.
     * 
     * @returns {Promise} Promise that resolves when the user is deleted.
     */
    async delete() {
        // Import the MongoDB model
        const mongoose = require('mongoose');
        const UserSchema = new mongoose.Schema({
            id: String,
            name: String,
            email: String,
            password: String,
            role: String
        });
        const UserModel = mongoose.model('User', UserSchema);

        // Find the user by ID and delete it
        return UserModel.findByIdAndDelete(this.id);
    }

    /**
     * Authenticates the user.
     * 
     * @param {string} password - Password to authenticate with.
     * @returns {boolean} True if the password is correct, false otherwise.
     */
    authenticate(password) {
        // Compare the provided password with the stored password
        return this.password === password;
    }

    /**
     * Gets the user's role.
     * 
     * @returns {string} The user's role.
     */
    getRole() {
        return this.role;
    }

    /**
     * Gets the user's email.
     * 
     * @returns {string} The user's email.
     */
    getEmail() {
        return this.email;
    }

    /**
     * Gets the user's name.
     * 
     * @returns {string} The user's name.
     */
    getName() {
        return this.name;
    }

    /**
     * Gets the user's ID.
     * 
     * @returns {string} The user's ID.
     */
    getId() {
        return this.id;
    }
}

// Example usage:
const user = new User('1', 'John Doe', 'john@example.com', 'password123', 'admin');
user.save().then(() => {
    console.log('User saved successfully');
}).catch((error) => {
    console.error('Error saving user:', error);
});

// Update the user
user.update({ name: 'Jane Doe' }).then(() => {
    console.log('User updated successfully');
}).catch((error) => {
    console.error('Error updating user:', error);
});

// Delete the user
user.delete().then(() => {
    console.log('User deleted successfully');
}).catch((error) => {
    console.error('Error deleting user:', error);
});

// Authenticate the user
if (user.authenticate('password123')) {
    console.log('Authentication successful');
} else {
    console.log('Authentication failed');
}

// Get the user's role
console.log('User role:', user.getRole());

// Get the user's email
console.log('User email:', user.getEmail());

// Get the user's name
console.log('User name:', user.getName());

// Get the user's ID
console.log('User ID:', user.getId());
```

This code defines a `User` class that represents a user entity. It has methods for saving, updating, and deleting the user, as well as authenticating the user and getting the user's role, email, name, and ID. The example usage demonstrates how to create a new user, save it to the database, update it, delete it, authenticate it, and get its details.