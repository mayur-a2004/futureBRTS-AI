import React, { useState, useEffect } from 'react';
import ProductList from './ProductList';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    const calculateTotal = () => {
      let total = 0;
      cartItems.forEach((item) => {
        total += item.price * item.quantity;
      });
      setTotal(total);
    };
    calculateTotal();
  }, [cartItems]);

  const handleAddToCart = (product) => {
    const existingItem = cartItems.find((item) => item.name === product.name);
    if (existingItem) {
      const updatedCart = cartItems.map((item) => {
        if (item.name === product.name) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
    localStorage.setItem('cart', JSON.stringify([...cartItems, { ...product, quantity: 1 }]));
  };

  const handleRemoveFromCart = (product) => {
    const updatedCart = cartItems.filter((item) => item.name !== product.name);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  return (
    <div className="cart-container">
      <h2>Cart</h2>
      <ProductList handleAddToCart={handleAddToCart} handleRemoveFromCart={handleRemoveFromCart} />
      <div className="cart-summary">
        <h3>Summary</h3>
        <p>Total: ${total}</p>
        <button>Checkout</button>
      </div>
    </div>
  );
};

export default Cart;