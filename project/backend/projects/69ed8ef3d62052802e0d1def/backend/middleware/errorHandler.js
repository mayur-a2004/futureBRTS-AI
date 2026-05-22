/* 
   UI PROTOTYPE MODE: BACKEND LOGIC PRESERVED AS DOCUMENTATION
   -----------------------------------------------------------
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const Product = require('../models/EcommerceModel');
const authorizeRoles = require('../middleware/auth');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new Error(message);
    error.status = 404;
  } else if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new Error(message);
    error.status = 400;
  } else if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new Error(message);
    error.status = 400;
  }

  res.status(error.status || 500).json({
    success: false,
    error: error.message,
    statusCode: error.status || 500
  });
};

module.exports = errorHandler;
*/
*/