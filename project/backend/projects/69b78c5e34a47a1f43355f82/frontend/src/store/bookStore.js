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
const REMOVE_BOOK_REQUEST = 'REMOVE_BOOK_REQUEST';
const REMOVE_BOOK_SUCCESS = 'REMOVE_BOOK_SUCCESS';
const REMOVE_BOOK_FAILURE = 'REMOVE_BOOK_FAILURE';

// Reducers
const bookReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_BOOKS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_BOOKS_SUCCESS:
      return { ...state, loading: false, books: action.books };
    case FETCH_BOOKS_FAILURE:
      return { ...state, loading: false, error: action.error };
    case ADD_BOOK_REQUEST:
      return { ...state, loading: true, error: null };
    case ADD_BOOK_SUCCESS:
      return { ...state, loading: false, books: [...state.books, action.book] };
    case ADD_BOOK_FAILURE:
      return { ...state, loading: false, error: action.error };
    case REMOVE_BOOK_REQUEST:
      return { ...state, loading: true, error: null };
    case REMOVE_BOOK_SUCCESS:
      return {
        ...state,
        loading: false,
        books: state.books.filter((book) => book._id !== action.bookId),
      };
    case REMOVE_BOOK_FAILURE:
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
};

// Actions
const fetchBooks = () => {
  return (dispatch) => {
    dispatch({ type: FETCH_BOOKS_REQUEST });
    axios
      .get('/api/books')
      .then((response) => {
        dispatch({ type: FETCH_BOOKS_SUCCESS, books: response.data });
      })
      .catch((error) => {
        dispatch({ type: FETCH_BOOKS_FAILURE, error: error.message });
      });
  };
};

const addBook = (book) => {
  return (dispatch) => {
    dispatch({ type: ADD_BOOK_REQUEST });
    axios
      .post('/api/books', book)
      .then((response) => {
        dispatch({ type: ADD_BOOK_SUCCESS, book: response.data });
      })
      .catch((error) => {
        dispatch({ type: ADD_BOOK_FAILURE, error: error.message });
      });
  };
};

const removeBook = (bookId) => {
  return (dispatch) => {
    dispatch({ type: REMOVE_BOOK_REQUEST });
    axios
      .delete(`/api/books/${bookId}`)
      .then((response) => {
        dispatch({ type: REMOVE_BOOK_SUCCESS, bookId });
      })
      .catch((error) => {
        dispatch({ type: REMOVE_BOOK_FAILURE, error: error.message });
      });
  };
};

// Store
const store = createStore(
  combineReducers({
    book: bookReducer,
  })
);

export { store, fetchBooks, addBook, removeBook };
```

This code manages the state of a book catalog and provides actions to fetch, add, and remove books. It uses Redux for state management and Axios for making API requests to the backend.

The `bookReducer` function handles the state changes based on the action types. The `fetchBooks`, `addBook`, and `removeBook` functions are action creators that dispatch the corresponding actions to the store.

The store is created using the `createStore` function from Redux, and it combines the `bookReducer` using the `combineReducers` function.

You can use this store in your React application to manage the book catalog state and dispatch actions to fetch, add, and remove books.

Example usage:
```javascript
import React, { useEffect } from 'react';
import { store, fetchBooks } from './bookStore';

const BookList = () => {
  useEffect(() => {
    store.dispatch(fetchBooks());
  }, []);

  const books = store.getState().book.books;

  return (
    <ul>
      {books.map((book) => (
        <li key={book._id}>{book.title}</li>
      ))}
    </ul>
  );
};
```
This example uses the `fetchBooks` action creator to fetch the book list when the component mounts, and then renders the book list using the `books` state from the store.