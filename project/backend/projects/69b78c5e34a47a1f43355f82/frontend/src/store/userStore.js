```javascript
// frontend/src/store/userStore.js

import { createStore, combineReducers } from 'redux';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Initial State
const initialState = {
  users: [],
  currentUser: null,
  isLoggedIn: false,
  isLoading: false,
  error: null,
};

// Action Types
const USER_REGISTER_REQUEST = 'USER_REGISTER_REQUEST';
const USER_REGISTER_SUCCESS = 'USER_REGISTER_SUCCESS';
const USER_REGISTER_FAILURE = 'USER_REGISTER_FAILURE';

const USER_LOGIN_REQUEST = 'USER_LOGIN_REQUEST';
const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS';
const USER_LOGIN_FAILURE = 'USER_LOGIN_FAILURE';

const USER_LOGOUT_REQUEST = 'USER_LOGOUT_REQUEST';
const USER_LOGOUT_SUCCESS = 'USER_LOGOUT_SUCCESS';
const USER_LOGOUT_FAILURE = 'USER_LOGOUT_FAILURE';

// Action Creators
export const registerUser = (userData) => {
  return async (dispatch) => {
    dispatch({ type: USER_REGISTER_REQUEST });
    try {
      const response = await axios.post('/api/users/register', userData);
      dispatch({ type: USER_REGISTER_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: USER_REGISTER_FAILURE, payload: error.message });
    }
  };
};

export const loginUser = (userData) => {
  return async (dispatch) => {
    dispatch({ type: USER_LOGIN_REQUEST });
    try {
      const response = await axios.post('/api/users/login', userData);
      dispatch({ type: USER_LOGIN_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: USER_LOGIN_FAILURE, payload: error.message });
    }
  };
};

export const logoutUser = () => {
  return async (dispatch) => {
    dispatch({ type: USER_LOGOUT_REQUEST });
    try {
      await axios.post('/api/users/logout');
      dispatch({ type: USER_LOGOUT_SUCCESS });
    } catch (error) {
      dispatch({ type: USER_LOGOUT_FAILURE, payload: error.message });
    }
  };
};

// Reducer
const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_REGISTER_REQUEST:
      return { ...state, isLoading: true };
    case USER_REGISTER_SUCCESS:
      return { ...state, users: [...state.users, action.payload], isLoading: false };
    case USER_REGISTER_FAILURE:
      return { ...state, error: action.payload, isLoading: false };
    case USER_LOGIN_REQUEST:
      return { ...state, isLoading: true };
    case USER_LOGIN_SUCCESS:
      return { ...state, currentUser: action.payload, isLoggedIn: true, isLoading: false };
    case USER_LOGIN_FAILURE:
      return { ...state, error: action.payload, isLoading: false };
    case USER_LOGOUT_REQUEST:
      return { ...state, isLoading: true };
    case USER_LOGOUT_SUCCESS:
      return { ...state, currentUser: null, isLoggedIn: false, isLoading: false };
    case USER_LOGOUT_FAILURE:
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
};

// Store
const store = createStore(userReducer);

export default store;
```

### Explanation

This code manages user account state and actions using Redux. It includes the following features:

*   **User Registration**: The `registerUser` action creator sends a POST request to the `/api/users/register` endpoint with the user's data. If the registration is successful, it dispatches the `USER_REGISTER_SUCCESS` action with the response data.
*   **User Login**: The `loginUser` action creator sends a POST request to the `/api/users/login` endpoint with the user's credentials. If the login is successful, it dispatches the `USER_LOGIN_SUCCESS` action with the response data.
*   **User Logout**: The `logoutUser` action creator sends a POST request to the `/api/users/logout` endpoint. If the logout is successful, it dispatches the `USER_LOGOUT_SUCCESS` action.
*   **Reducer**: The `userReducer` function handles the different action types and updates the state accordingly. It manages the user's registration, login, and logout state, as well as any errors that may occur.
*   **Store**: The `store` is created using the `createStore` function from Redux, and it uses the `userReducer` function to manage the state.

### Example Use Cases

To use this code, you can import the `registerUser`, `loginUser`, and `logoutUser` action creators in your React components and dispatch them as needed. For example:

```javascript
import React, { useState } from 'react';
import { registerUser } from './userStore';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const userData = { username, email, password };
    registerUser(userData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username" />
      <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterForm;
```

Similarly, you can use the `loginUser` and `logoutUser` action creators in your login and logout components.

### API Endpoints

This code assumes that you have the following API endpoints:

*   **POST /api/users/register**: Creates a new user account.
*   **POST /api/users/login**: Logs in an existing user.
*   **POST /api/users/logout**: Logs out the current user.

You will need to implement these endpoints on your server-side using a framework like Express.js and a database like MongoDB. For example:

```javascript
const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

app.post('/api/users/register', (req, res) => {
  const { username, email, password } = req.body;
  const user = new User({ username, email, password });
  user.save((err) => {
    if (err) {
      res.status(400).send({ message: 'User already exists' });
    } else {
      res.send({ message: 'User created successfully' });
    }
  });
});

app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      res.status(401).send({ message: 'Invalid email or password' });
    } else {
      if (user.password === password) {
        res.send({ message: 'Logged in successfully' });
      } else {
        res.status(401).send({ message: 'Invalid email or password' });
      }
    }
  });
});

app.post('/api/users/logout', (req, res) => {
  res.send({ message: 'Logged out successfully' });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
```

Note that this is a simplified example and you should implement proper error handling, validation, and security measures in your production application.