import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import mockData from './data/mockData';

function App() {
  const [properties, setProperties] = useState(mockData.properties);
  const [trends, setTrends] = useState(mockData.trends);
  const [stats, setStats] = useState(mockData.stats);
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    document.body.style.background = darkMode ? '#0F172A' : '#FFFFFF';
  }, [darkMode]);

  return (
    <AuthProvider>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-brand">MaiaHomes</div>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/properties" className="nav-link">
                Properties
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/trends" className="nav-link">
                Trends
              </Link>
            </li>
          </ul>
          <button className="toggle-dark-mode" onClick={handleToggleDarkMode}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </nav>
        <main className="main">
          <section className="hero">
            <h1 className="hero-title">MaiaHomes Real Estate Portal</h1>
            <p className="hero-subtitle">Find your dream home with us</p>
          </section>
          <section className="stats">
            <h2 className="stats-title">Market Stats</h2>
            <div className="stats-cards">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <h3 className="stat-card-title">{stat.title}</h3>
                  <p className="stat-card-value">{stat.value}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="trends">
            <h2 className="trends-title">Market Trends</h2>
            <div className="trends-cards">
              {trends.map((trend, index) => (
                <div key={index} className="trend-card">
                  <h3 className="trend-card-title">{trend.title}</h3>
                  <p className="trend-card-value">{trend.value}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="properties">
            <h2 className="properties-title">Properties</h2>
            <div className="properties-cards">
              {properties.map((property, index) => (
                <div key={index} className="property-card">
                  <h3 className="property-card-title">{property.title}</h3>
                  <p className="property-card-price">{property.price}</p>
                  <p className="property-card-description">{property.description}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;