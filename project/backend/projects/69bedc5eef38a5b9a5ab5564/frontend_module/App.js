import React from 'react';
import './App.css';
import ProductCard from './components/ProductCard';
const App = () => {
  const products = [
    { id: 1, name: 'Product 1', description: 'This is product 1', price: 10.99, image: 'https://example.com/product1.jpg' },
    { id: 2, name: 'Product 2', description: 'This is product 2', price: 9.99, image: 'https://example.com/product2.jpg' }
  ];
  return (
    <div className='app'
      style={{
        backgroundImage: `linear-gradient(to bottom, #ffffff, #f7f7f7)`,
        minHeight: '100vh'
      }}
    >
      <h1>Products</h1>
      <div className='product-grid'
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px'
        }}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
export default App;