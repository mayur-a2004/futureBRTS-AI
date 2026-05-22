import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Wishlist from './components/Wishlist';
import ReviewForm from './components/ReviewForm';
import ReviewList from './components/ReviewList';
import PaymentForm from './components/PaymentForm';
import OrderSummary from './components/OrderSummary';

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductCard />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/review" element={<ReviewForm />} />
        <Route path="/reviews" element={<ReviewList />} />
        <Route path="/payment" element={<PaymentForm />} />
        <Route path="/order-summary" element={<OrderSummary />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));