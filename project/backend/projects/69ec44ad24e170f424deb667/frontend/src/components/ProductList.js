import React from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ products }) => {
  return (
    <div className="product-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Category</th>
            <th>Sub Category</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductCard
              key={product._id}
              name={product.name}
              description={product.description}
              price={product.price}
              stock={product.stock}
              category={product.category}
              subCategory={product.subCategory}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;