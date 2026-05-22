import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import './AnalyticsPage.css'; // Optional: Add styles for your page

const AnalyticsPage = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch('/api/users');
        const productResponse = await fetch('/api/products');
        const orderResponse = await fetch('/api/orders');
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUsers(userData);
        }
        if (productResponse.ok) {
          const productData = await productResponse.json();
          setProducts(productData);
        }
        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          setOrders(orderData);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <>
      <Header />
      <div className="analytics-container">
        <h1>Analytics Data</h1>

        <h2>Users</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>{new Date(user.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Products</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>{product.price}</td>
                <td>{product.stock}</td>
                <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                <td>{new Date(product.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <h2>Orders</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>References</th>
              <th>Product ID</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.userId}</td>
                <td>{order.references}</td>
                <td>{order.productId}</td>
                <td>{order.quantity}</td>
                <td>{order.total}</td>
                <td>{order.status}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{new Date(order.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
      </div>
    </>
  );
};

export default AnalyticsPage;