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

// Reducers
const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_REGISTER_REQUEST:
      return { ...state, isLoading: true, error: null };
    case USER_REGISTER_SUCCESS:
      return { ...state, users: [...state.users, action.payload], isLoading: false };
    case USER_REGISTER_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case USER_LOGIN_REQUEST:
      return { ...state, isLoading: true, error: null };
    case USER_LOGIN_SUCCESS:
      return { ...state, currentUser: action.payload, isLoggedIn: true, isLoading: false };
    case USER_LOGIN_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case USER_LOGOUT_REQUEST:
      return { ...state, isLoading: true };
    case USER_LOGOUT_SUCCESS:
      return { ...state, currentUser: null, isLoggedIn: false, isLoading: false };
    case USER_LOGOUT_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    default:
      return state;
  }
};

// Actions
const registerUser = (userData) => {
  return (dispatch) => {
    dispatch({ type: USER_REGISTER_REQUEST });
    axios
      .post('/api/users/register', userData)
      .then((response) => {
        dispatch({ type: USER_REGISTER_SUCCESS, payload: response.data });
      })
      .catch((error) => {
        dispatch({ type: USER_REGISTER_FAILURE, payload: error.message });
      });
  };
};

const loginUser = (userData) => {
  return (dispatch) => {
    dispatch({ type: USER_LOGIN_REQUEST });
    axios
      .post('/api/users/login', userData)
      .then((response) => {
        dispatch({ type: USER_LOGIN_SUCCESS, payload: response.data });
      })
      .catch((error) => {
        dispatch({ type: USER_LOGIN_FAILURE, payload: error.message });
      });
  };
};

const logoutUser = () => {
  return (dispatch) => {
    dispatch({ type: USER_LOGOUT_REQUEST });
    axios
      .post('/api/users/logout')
      .then((response) => {
        dispatch({ type: USER_LOGOUT_SUCCESS });
      })
      .catch((error) => {
        dispatch({ type: USER_LOGOUT_FAILURE, payload: error.message });
      });
  };
};

// Store
const store = createStore(combineReducers({ user: userReducer }));

// Export
export { store, registerUser, loginUser, logoutUser };
```

### Explanation

This code manages user state using Redux. It includes the following features:

1.  **User Registration**: The `registerUser` action sends a POST request to the `/api/users/register` endpoint with the user's data. If the request is successful, it dispatches the `USER_REGISTER_SUCCESS` action with the response data. If the request fails, it dispatches the `USER_REGISTER_FAILURE` action with the error message.
2.  **User Login**: The `loginUser` action sends a POST request to the `/api/users/login` endpoint with the user's data. If the request is successful, it dispatches the `USER_LOGIN_SUCCESS` action with the response data. If the request fails, it dispatches the `USER_LOGIN_FAILURE` action with the error message.
3.  **User Logout**: The `logoutUser` action sends a POST request to the `/api/users/logout` endpoint. If the request is successful, it dispatches the `USER_LOGOUT_SUCCESS` action. If the request fails, it dispatches the `USER_LOGOUT_FAILURE` action with the error message.

The `userReducer` function handles these actions and updates the state accordingly. The state includes the following properties:

*   `users`: An array of all registered users.
*   `currentUser`: The currently logged-in user.
*   `isLoggedIn`: A boolean indicating whether a user is logged in.
*   `isLoading`: A boolean indicating whether a request is in progress.
*   `error`: An error message if a request fails.

The `store` is created using the `createStore` function from Redux, and it combines the `userReducer` function using the `combineReducers` function.

### Example Usage

To use this code, you can import the `store`, `registerUser`, `loginUser`, and `logoutUser` functions in your React components. For example:

```javascript
import React, { useState } from 'react';
import { store, registerUser, loginUser, logoutUser } from './userStore';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    store.dispatch(registerUser({ username, password }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} />
      <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      <button type="submit">Register</button>
    </form>
  );
};

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    store.dispatch(loginUser({ username, password }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} />
      <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
};

const LogoutButton = () => {
  const handleLogout = () => {
    store.dispatch(logoutUser());
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
};
```

This code creates a simple registration form, login form, and logout button that interact with the `userStore`.