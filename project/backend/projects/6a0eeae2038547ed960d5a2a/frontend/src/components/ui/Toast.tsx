import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';
import { properties } from './data/mockData';
import { AuthProvider } from './context/AuthContext';
import { ToastContext } from './context/ToastContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedProperties from './components/FeaturedProperties';
import PropertyList from './components/PropertyList';
import Footer from './components/Footer';

function App() {
  const [toast, setToast] = useState(null);

  const handleToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <AuthProvider>
      <ToastContext.Provider value={{ toast, handleToast }}>
        <div className="app">
          <Navbar />
          <Hero />
          <FeaturedProperties properties={properties} />
          <PropertyList properties={properties} />
          <Footer />
          {toast && (
            <div
              className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}
            >
              {toast.message}
            </div>
          )}
        </div>
      </ToastContext.Provider>
    </AuthProvider>
  );
}

export default App;