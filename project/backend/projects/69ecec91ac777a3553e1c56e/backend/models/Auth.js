/*
module.exports = {
  AuthenticationModel: {
    login: async (username, password) => {
      // Import the User model
      const User = require('../models/User');

      try {
        // Find the user by username
        const user = await User.findOne({ username });

        // If the user is not found, return null
        if (!user) {
          return null;
        }

        // Check if the password is correct
        const isMatch = await user.comparePassword(password);

        // If the password is not correct, return null
        if (!isMatch) {
          return null;
        }

        // If the user is found and the password is correct, return the user
        return user;
      } catch (error) {
        console.error('Error during login:', error);
        return null;
      }
    },

    register: async (userData) => {
      // Import the User model
      const User = require('../models/User');

      try {
        // Create a new user
        const newUser = new User(userData);

        // Save the new user to the database
        const savedUser = await newUser.save();

        // Return the saved user
        return savedUser;
      } catch (error) {
        console.error('Error during registration:', error);
        return null;
      }
    },

    verifyUser: async (token) => {
      // Placeholder for user verification logic.  In a real application,
      // this would involve checking the token against a database or
      // external service.
      // For now, always return true to simulate successful verification.
      return true;
    },

    resetPassword: async (email, newPassword) => {
      // Import the User model
      const User = require('../models/User');

      try {
        // Find the user by email
        const user = await User.findOne({ email });

        // If the user is not found, return null
        if (!user) {
          return null;
        }

        // Update the user's password
        user.password = newPassword;
        await user.save();

        // Return the updated user
        return user;
      } catch (error) {
        console.error('Error during password reset:', error);
        return null;
      }
    },

    getUserByUsername: async (username) => {
      const User = require('../models/User');
      try {
        const user = await User.findOne({ username });
        return user;
      } catch (error) {
        console.error('Error getting user by username:', error);
        return null;
      }
    },

    getUserById: async (userId) => {
      const User = require('../models/User');
      try {
        const user = await User.findById(userId);
        return user;
      } catch (error) {
        console.error('Error getting user by ID:', error);
        return null;
      }
    }
  }
};
*/