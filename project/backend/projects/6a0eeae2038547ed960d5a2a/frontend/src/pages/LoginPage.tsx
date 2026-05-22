import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import mockData from './data/mockData';

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { saveToLocalStorage, getFromLocalStorage } = useLocalStorage();

  const handleLogin = () => {
    if (email === 'admin@example.com' && password === 'password123') {
      setIsLoggedIn(true);
      saveToLocalStorage('isLoggedIn', true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    saveToLocalStorage('isLoggedIn', false);
  };

  return (
    <AuthProvider>
      <div className="app-container">
        <nav className="navbar">
          <div className="logo">MaiaHomes</div>
          <ul className="nav-links">
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#properties">Properties</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
          </ul>
          {isLoggedIn ? (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button className="login-btn" onClick={() => console.log('Login')}>
              Login
            </button>
          )}
        </nav>
        <div className="hero-section">
          <h1 className="hero-title">Find Your Dream Home</h1>
          <p className="hero-subtitle">Explore our collection of luxury properties</p>
          <button className="hero-cta">Explore Properties</button>
        </div>
        <div className="properties-section">
          <h2 className="properties-title">Properties</h2>
          <div className="properties-grid">
            {mockData.properties.map((property) => (
              <div key={property.id} className="property-card">
                <img src={property.image} alt={property.name} />
                <h3 className="property-name">{property.name}</h3>
                <p className="property-price">${property.price}</p>
                <p className="property-location">{property.location}</p>
                <button className="property-cta">View Details</button>
              </div>
            ))}
          </div>
        </div>
        <div className="about-section">
          <h2 className="about-title">About Us</h2>
          <p className="about-text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet nulla auctor, vestibulum magna sed, convallis ex.
          </p>
        </div>
        <div className="login-page">
          <div className="login-form">
            <h2 className="login-title">Login</h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <button className="login-btn" onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

export default App;