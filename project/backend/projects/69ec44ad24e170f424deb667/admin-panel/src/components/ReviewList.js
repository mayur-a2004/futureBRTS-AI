import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import User from '../models/User';

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await User.find({ role: 'customer' });
        setReviews(response);
      } catch (error) {
        console.error(error);
      }
    };
    fetchReviews();
  }, []);

  const handleDeleteReview = async (id) => {
    try {
      await User.findByIdAndDelete(id);
      setReviews(reviews.filter((review) => review._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dashboard>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Review</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review._id}>
              <td>{review.name}</td>
              <td>{review.email}</td>
              <td>{review.description}</td>
              <td>
                <button onClick={() => handleDeleteReview(review._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Dashboard>
  );
};

export default ReviewList;