import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserList from './components/UserList';
import ProductList from './components/ProductList';
import OrderList from './components/OrderList';
import ReviewList from './components/ReviewList';
import PaymentList from './components/PaymentList';
import WishlistList from './components/WishlistList';
import CartList from './components/CartList';
import AnalyticsList from './components/AnalyticsList';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/reviews" element={<ReviewList />} />
        <Route path="/payments" element={<PaymentList />} />
        <Route path="/wishlists" element={<WishlistList />} />
        <Route path="/carts" element={<CartList />} />
        <Route path="/analytics" element={<AnalyticsList />} />
      </Routes>
    </BrowserRouter>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));