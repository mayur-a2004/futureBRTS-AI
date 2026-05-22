import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import { User } from '../models/schema';

const CartList = () => {
  const [carts, setCarts] = useState([]);

  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const response = await User.find({ role: 'customer' });
        const carts = response.map((user) => user.carts);
        setCarts(carts);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCarts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await User.findByIdAndUpdate(id, { $pull: { carts: { _id: id } } });
      const updatedCarts = await User.find({ role: 'customer' });
      const updatedCartList = updatedCarts.map((user) => user.carts);
      setCarts(updatedCartList);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dashboard>
      <table>
        <thead>
          <tr>
            <th>Cart ID</th>
            <th>User ID</th>
            <th>Total</th>
            <th>Status</th>
            <th>Payment Method</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {carts.map((cart) => (
            <tr key={cart._id}>
              <td>{cart._id}</td>
              <td>{cart.userId}</td>
              <td>{cart.total}</td>
              <td>{cart.status}</td>
              <td>{cart.paymentMethod}</td>
              <td>
                <button onClick={() => handleDelete(cart._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Dashboard>
  );
};

export default CartList;