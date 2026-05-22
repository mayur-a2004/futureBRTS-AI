import React, { useState, useEffect } from 'react';
import './App.css';
import { Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import mockData from './data/mockData';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useLocalStorage('user', null);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode === 'true') {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', !darkMode);
  };

  return (
    <AuthProvider>
      <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
        <header className="header">
          <nav className="navbar">
            <div className="logo">MaiaHomes</div>
            <ul className="nav-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/features">Features</Link>
              </li>
              <li>
                <Link to="/stats">Stats</Link>
              </li>
            </ul>
            <button className="toggle-dark-mode" onClick={toggleDarkMode}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </nav>
        </header>
        <main className="main">
          <section className="hero">
            <h1 className="hero-title">Find your dream home</h1>
            <p className="hero-subtitle">Explore our premium real estate listings</p>
            <button className="hero-cta">Get Started</button>
          </section>
          <section className="features">
            <h2 className="features-title">Features</h2>
            <ul className="features-list">
              {mockData.features.map((feature, index) => (
                <li key={index} className="feature-item">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </li>
              ))}
            </ul>
          </section>
          <section className="stats">
            <h2 className="stats-title">Stats</h2>
            <ul className="stats-list">
              {mockData.stats.map((stat, index) => (
                <li key={index} className="stat-item">
                  <h3 className="stat-title">{stat.title}</h3>
                  <p className="stat-value">{stat.value}</p>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;