import React, { useState, useEffect } from 'react';
import ReviewForm from './ReviewForm';

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews');
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchReviews();
  }, []);

  const handleAddReview = (newReview) => {
    setReviews((prevReviews) => [...prevReviews, newReview]);
  };

  return (
    <div>
      <h2>Reviews</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Review</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review._id}>
              <td>{review.name}</td>
              <td>{review.email}</td>
              <td>{review.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ReviewForm onAddReview={handleAddReview} />
    </div>
  );
};

export default ReviewList;