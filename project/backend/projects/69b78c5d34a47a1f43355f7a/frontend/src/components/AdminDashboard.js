```javascript
// frontend/src/components/AdminDashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
        setUserCount(response.data.length);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
        setProductCount(response.data.length);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders');
        setOrders(response.data);
        setOrderCount(response.data.length);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();
    fetchProducts();
    fetchOrders();
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h2>Users</h2>
          <p>{userCount}</p>
        </div>
        <div className="stat-card">
          <h2>Products</h2>
          <p>{productCount}</p>
        </div>
        <div className="stat-card">
          <h2>Orders</h2>
          <p>{orderCount}</p>
        </div>
      </div>
      <div className="user-list">
        <h2>Users</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="product-list">
        <h2>Products</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product._id}</td>
                <td>{product.name}</td>
                <td>{product.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="order-list">
        <h2>Orders</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.customer.name}</td>
                <td>{order.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="action-buttons">
        <Link to="/admin/users">Manage Users</Link>
        <Link to="/admin/products">Manage Products</Link>
        <Link to="/admin/orders">Manage Orders</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
```

```css
/* frontend/src/components/AdminDashboard.css */

.admin-dashboard {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.dashboard-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.stat-card {
  background-color: #fff;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  width: calc(33.33% - 20px);
}

.stat-card h2 {
  margin-top: 0;
}

.user-list,
.product-list,
.order-list {
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

th {
  background-color: #f0f0f0;
}

.action-buttons {
  margin-top: 20px;
}

.action-buttons a {
  margin-right: 20px;
}
```

This code creates an admin dashboard that displays statistics about users, products, and orders. It also lists the users, products, and orders in tables. The dashboard includes links to manage each of these entities. The CSS styles the dashboard with a clean and modern design.

**Server-side code (Core PHP)**

```php
// api/users.php

require_once 'db.php';

$users = $db->query("SELECT * FROM users")->fetchAll();

echo json_encode($users);
```

```php
// api/products.php

require_once 'db.php';

$products = $db->query("SELECT * FROM products")->fetchAll();

echo json_encode($products);
```

```php
// api/orders.php

require_once 'db.php';

$orders = $db->query("SELECT * FROM orders")->fetchAll();

echo json_encode($orders);
```

This code assumes that you have a database connection established in `db.php` and that you have tables for users, products, and orders in your database. The API endpoints return the data from these tables in JSON format.

**Database (MongoDB)**

You can use the following MongoDB collections to store the data:

```json
// users collection

{
  "_id": ObjectId,
  "name": String,
  "email": String
}

// products collection

{
  "_id": ObjectId,
  "name": String,
  "price": Number
}

// orders collection

{
  "_id": ObjectId,
  "customer": {
    "name": String
  },
  "total": Number
}
```

You can use the MongoDB Node.js driver to interact with your MongoDB database from your Node.js application.

```javascript
// db.js

const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'mydatabase';

const client = new MongoClient(url);

async function connect() {
  await client.connect();
  console.log('Connected to MongoDB');
  const db = client.db(dbName);
  return db;
}

module.exports = connect;
```

You can then use the `connect` function to establish a connection to your MongoDB database and perform CRUD operations.

```javascript
// api/users.js

const express = require('express');
const router = express.Router();
const connect = require('./db');

router.get('/', async (req, res) => {
  const db = await connect();
  const users = db.collection('users');
  const result = await users.find().toArray();
  res.json(result);
});

module.exports = router;
```

This code sets up an Express.js route to retrieve all users from the `users` collection in your MongoDB database.