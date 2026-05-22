import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProductCard = ({ product }) => {
  return (
    <div>
      <Header />
      <div className="product-card">
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <p>Price: ${product.price}</p>
        <p>Stock: {product.stock}</p>
        <p>Category: {product.category}</p>
        <p>Sub Category: {product.subCategory}</p>
      </div>
      <Footer />
    </div>
  );
};

export default ProductCard;