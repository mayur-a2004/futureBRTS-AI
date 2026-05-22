import React, { useState, useEffect } from 'react';
import Dashboard from '../Dashboard';
import axios from 'axios';

const WishlistList = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await axios.get('/api/wishlist');
        setWishlist(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/wishlist/${id}`);
      setWishlist(wishlist.filter((item) => item._id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Dashboard>
      <h1>Wishlist List</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Sub Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {wishlist.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.price}</td>
                <td>{item.category}</td>
                <td>{item.subCategory}</td>
                <td>
                  <button onClick={() => handleDelete(item._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Dashboard>
  );
};

export default WishlistList;