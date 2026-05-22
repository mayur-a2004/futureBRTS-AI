```javascript
// frontend/src/store/bookStore.js

import { createStore, combineReducers } from 'redux';
import axios from 'axios';

// Initial State
const initialState = {
  books: [],
  loading: false,
  error: null,
};

// Action Types
const FETCH_BOOKS_REQUEST = 'FETCH_BOOKS_REQUEST';
const FETCH_BOOKS_SUCCESS = 'FETCH_BOOKS_SUCCESS';
const FETCH_BOOKS_FAILURE = 'FETCH_BOOKS_FAILURE';
const ADD_BOOK_REQUEST = 'ADD_BOOK_REQUEST';
const ADD_BOOK_SUCCESS = 'ADD_BOOK_SUCCESS';
const ADD_BOOK_FAILURE = 'ADD_BOOK_FAILURE';
const DELETE_BOOK_REQUEST = 'DELETE_BOOK_REQUEST';
const DELETE_BOOK_SUCCESS = 'DELETE_BOOK_SUCCESS';
const DELETE_BOOK_FAILURE = 'DELETE_BOOK_FAILURE';

// Reducers
const bookReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_BOOKS_REQUEST:
      return { ...state, loading: true };
    case FETCH_BOOKS_SUCCESS:
      return { ...state, loading: false, books: action.books };
    case FETCH_BOOKS_FAILURE:
      return { ...state, loading: false, error: action.error };
    case ADD_BOOK_REQUEST:
      return { ...state, loading: true };
    case ADD_BOOK_SUCCESS:
      return { ...state, loading: false, books: [...state.books, action.book] };
    case ADD_BOOK_FAILURE:
      return { ...state, loading: false, error: action.error };
    case DELETE_BOOK_REQUEST:
      return { ...state, loading: true };
    case DELETE_BOOK_SUCCESS:
      return { ...state, loading: false, books: state.books.filter(book => book._id !== action.bookId) };
    case DELETE_BOOK_FAILURE:
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
};

// Actions
const fetchBooksRequest = () => ({ type: FETCH_BOOKS_REQUEST });
const fetchBooksSuccess = books => ({ type: FETCH_BOOKS_SUCCESS, books });
const fetchBooksFailure = error => ({ type: FETCH_BOOKS_FAILURE, error });
const addBookRequest = () => ({ type: ADD_BOOK_REQUEST });
const addBookSuccess = book => ({ type: ADD_BOOK_SUCCESS, book });
const addBookFailure = error => ({ type: ADD_BOOK_FAILURE, error });
const deleteBookRequest = () => ({ type: DELETE_BOOK_REQUEST });
const deleteBookSuccess = bookId => ({ type: DELETE_BOOK_SUCCESS, bookId });
const deleteBookFailure = error => ({ type: DELETE_BOOK_FAILURE, error });

// Thunk Actions
const fetchBooks = () => {
  return dispatch => {
    dispatch(fetchBooksRequest());
    axios.get('/api/books')
      .then(response => {
        dispatch(fetchBooksSuccess(response.data));
      })
      .catch(error => {
        dispatch(fetchBooksFailure(error.message));
      });
  };
};

const addBook = book => {
  return dispatch => {
    dispatch(addBookRequest());
    axios.post('/api/books', book)
      .then(response => {
        dispatch(addBookSuccess(response.data));
      })
      .catch(error => {
        dispatch(addBookFailure(error.message));
      });
  };
};

const deleteBook = bookId => {
  return dispatch => {
    dispatch(deleteBookRequest());
    axios.delete(`/api/books/${bookId}`)
      .then(() => {
        dispatch(deleteBookSuccess(bookId));
      })
      .catch(error => {
        dispatch(deleteBookFailure(error.message));
      });
  };
};

// Store
const store = createStore(
  combineReducers({
    book: bookReducer,
  }),
);

export {
  store,
  fetchBooks,
  addBook,
  deleteBook,
};
```

### Explanation

This code manages the state of books in a frontend application using Redux. It includes the following features:

*   **Initial State**: The initial state of the application is defined with an empty array of books, a loading flag set to false, and an error message set to null.
*   **Action Types**: Action types are defined for fetching books, adding a book, and deleting a book. Each action type has a corresponding request, success, and failure action.
*   **Reducers**: The book reducer handles the state changes based on the action types. It updates the state accordingly for each action type.
*   **Actions**: Action creators are defined for each action type. These action creators return an action object with the corresponding type and payload.
*   **Thunk Actions**: Thunk actions are defined for fetching books, adding a book, and deleting a book. These thunk actions dispatch the corresponding request, success, and failure actions based on the API response.
*   **Store**: The store is created using the `createStore` function from Redux, and it combines the book reducer using the `combineReducers` function.

### Usage

To use this code, you can import the store and the action creators in your application and dispatch the actions as needed. For example:

```javascript
import React, { useEffect } from 'react';
import { store } from './bookStore';
import { fetchBooks } from './bookStore';

const BookList = () => {
  useEffect(() => {
    store.dispatch(fetchBooks());
  }, []);

  const books = store.getState().book.books;

  return (
    <ul>
      {books.map(book => (
        <li key={book._id}>{book.title}</li>
      ))}
    </ul>
  );
};
```

In this example, the `fetchBooks` action is dispatched when the component mounts, and the book list is rendered based on the state of the store.