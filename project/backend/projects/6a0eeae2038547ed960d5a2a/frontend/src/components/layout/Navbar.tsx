import React, { useState } from 'react';
import './App.css';
import mockData from './data/mockData';
import { AuthProvider } from './context/AuthContext';
import useLocalStorage from './hooks/useLocalStorage';

const App = () => {
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const [listings, setListings] = useState(mockData.listings);

  const handleFavoriteToggle = (property) => {
    if (favorites.includes(property.id)) {
      setFavorites(favorites.filter(fav => fav !== property.id));
    } else {
      setFavorites([...favorites, property.id]);
    }
  };

  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <HeroSection />
        <Listings listings={listings} onFavoriteToggle={handleFavoriteToggle} favorites={favorites} />
      </div>
    </AuthProvider>
  );
};

const Navbar = () => {
  return (
    <nav className="navbar glassmorphic">
      <div className="container">
        <h1 className="navbar-title">MaiaHomes</h1>
        <ul className="navbar-links">
          <li><a href="#listings">Listings</a></li>
          <li><a href="#about">About Us</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>
    </nav>
  );
};

const HeroSection = () => {
  return (
    <section className="hero glassmorphic" id="hero">
      <h2 className="hero-title">Find Your Dream Home</h2>
      <p className="hero-subtitle">Explore the best properties in your area.</p>
    </section>
  );
};

const Listings = ({ listings, onFavoriteToggle, favorites }) => {
  return (
    <section className="listings glassmorphic" id="listings">
      <h2 className="listings-title">Property Listings</h2>
      <div className="listings-grid">
        {listings.map(property => (
          <ListingCard key={property.id} property={property} onFavoriteToggle={onFavoriteToggle} isFavorite={favorites.includes(property.id)} />
        ))}
      </div>
    </section>
  );
};

const ListingCard = ({ property, onFavoriteToggle, isFavorite }) => {
  return (
    <div className="listing-card glassmorphic">
      <img src={property.image} alt={property.title} className="listing-image" />
      <h3 className="listing-title">{property.title}</h3>
      <p className="listing-price">${property.price}</p>
      <button onClick={() => onFavoriteToggle(property)} className={`favorite-button ${isFavorite ? 'active' : ''}`}>
        {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      </button>
    </div>
  );
};

export default App;

import React from 'react';

const mockData = {
  listings: [
    {
      id: 1,
      title: 'Modern Family Home',
      price: '450,000',
      image: 'https://via.placeholder.com/300x200.png?text=Home+1'
    },
    {
      id: 2,
      title: 'Luxury Apartment',
      price: '750,000',
      image: 'https://via.placeholder.com/300x200.png?text=Home+2'
    },
    {
      id: 3,
      title: 'Cozy Cottage',
      price: '325,000',
      image: 'https://via.placeholder.com/300x200.png?text=Home+3'
    },
  ]
};

export default mockData;

import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

import { useState } from 'react';

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: radial-gradient(circle, rgba(15,23,42,1) 0%, rgba(33,38,49,1) 50%, rgba(15,23,42,1) 100%);
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 20px;
}

.glassmorphic {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 15px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 4px 30px rgba(0,0,0,0.1);
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-title {
  color: #fff;
  font-size: 24px;
  font-weight: 800;
}

.navbar-links {
  list-style: none;
  display: flex;
  gap: 20px;
}

.navbar-links a {
  color: #fff;
  text-decoration: none;
  transition: transform 0.3s;
}

.navbar-links a:hover {
  transform: scale(1.05);
}

.hero {
  text-align: center;
  padding: 80px 0;
  color: #fff;
}

.hero-title {
  font-size: 40px;
  font-weight: 800;
}

.hero-subtitle {
  font-size: 20px;
  font-weight: 400;
}

.listings {
  padding: 40px;
}

.listings-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 20px;
}

.listings-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.listing-card {
  padding: 20px;
  border-radius: 15px;
  transition: transform 0.3s;
}

.listing-card:hover {
  transform: scale(1.05);
}

.favorite-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.3s;
}

.favorite-button:hover {
  transform: scale(1.05);
}

.favorite-button.active {
  background-color: #dc3545;
}