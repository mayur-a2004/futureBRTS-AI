import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import mockData from './data/mockData';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState(mockData.properties);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (user) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleSelectProperty = (property) => {
    setSelectedProperty(property);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <nav className="navbar">
            <Link to="/" className="nav-link">
              MaiaHomes
            </Link>
            <ul className="nav-links">
              <li>
                <Link to="/properties" className="nav-link">
                  Properties
                </Link>
              </li>
              <li>
                <Link to="/about" className="nav-link">
                  About
                </Link>
              </li>
              {user ? (
                <li>
                  <button className="nav-link" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              ) : (
                <li>
                  <Link to="/login" className="nav-link">
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          <main className="main-content">
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/properties">
              <Properties properties={properties} handleSelectProperty={handleSelectProperty} />
            </Route>
            <Route path="/about">
              <About />
            </Route>
            <Route path="/login">
              <Login handleLogin={handleLogin} />
            </Route>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

function Home() {
  return (
    <div className="home-container">
      <h1 className="title">Welcome to MaiaHomes</h1>
      <p className="description">Your premier real estate portal</p>
      <button className="call-to-action">Explore Properties</button>
    </div>
  );
}

function Properties({ properties, handleSelectProperty }) {
  return (
    <div className="properties-container">
      <h1 className="title">Properties</h1>
      <ul className="properties-list">
        {properties.map((property) => (
          <li key={property.id} className="property-card">
            <h2 className="property-title">{property.title}</h2>
            <p className="property-description">{property.description}</p>
            <button className="view-details" onClick={() => handleSelectProperty(property)}>
              View Details
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function About() {
  return (
    <div className="about-container">
      <h1 className="title">About Us</h1>
      <p className="description">MaiaHomes is a real estate portal dedicated to providing the best properties for our clients.</p>
    </div>
  );
}

function Login({ handleLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const user = { username, password };
    handleLogin(user);
  };

  return (
    <div className="login-container">
      <h1 className="title">Login</h1>
      <form onSubmit={handleSubmit}>
        <label className="label">Username:</label>
        <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} />
        <label className="label">Password:</label>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <button type="submit" className="submit-button">
          Login
        </button>
      </form>
    </div>
  );
}

export default App;