import React, { useState, useEffect } from 'react';
import Dashboard from '../Dashboard';
import User from '../models/User';

const OrderList = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await User.find({ role: 'customer' });
        const orders = response.map((user) => user);
        setOrders(orders);
      } catch (error) {
        console.error(error);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await User.findByIdAndUpdate(orderId, { status });
      const updatedOrders = orders.map((order) => {
        if (order._id.toString() === orderId) {
          return { ...order, status };
        }
        return order;
      });
      setOrders(updatedOrders);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dashboard>
      <h1>Order List</h1>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User ID</th>
            <th>Total</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.userId}</td>
              <td>{order.total}</td>
              <td>{order.paymentMethod}</td>
              <td>{order.status}</td>
              <td>
                <button onClick={() => handleStatusChange(order._id, 'shipped')}>Ship</button>
                <button onClick={() => handleStatusChange(order._id, 'delivered')}>Deliver</button>
                <button onClick={() => handleStatusChange(order._id, 'cancelled')}>Cancel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Dashboard>
  );
};

export default OrderList;