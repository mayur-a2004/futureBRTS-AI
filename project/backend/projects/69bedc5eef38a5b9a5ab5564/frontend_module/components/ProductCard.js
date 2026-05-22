import React from 'react';
import './ProductCard.css';
const ProductCard = ({ product }) => {
  return (
    <div className='product-card'
      style={{
        backgroundImage: `linear-gradient(to bottom, #ffffff, #f7f7f7)`,
        boxShadow: '0px 0px 10px rgba(0,0,0,0.1)'
      }}
    >
      <img src={product.image} alt={product.name} />
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p>Price: {product.price}</p>
      <button>Add to Cart</button>
    </div>
  );
};
export default ProductCard;