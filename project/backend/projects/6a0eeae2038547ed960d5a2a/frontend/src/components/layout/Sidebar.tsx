import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import './App.css';
import mockData from './data/mockData';
import { AuthProvider } from './context/AuthContext';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const [properties, setProperties] = useState(mockData.properties);
  const [agents, setAgents] = useState(mockData.agents);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <AuthProvider value={{ currentUser, handleLogin, handleLogout }}>
      <Router>
        <div className="app-container">
          <header className="header">
            <nav className="navbar">
              <Link to="/" className="logo">
                MaiaHomes
              </Link>
              <ul className="nav-links">
                <li>
                  <Link to="/properties">Properties</Link>
                </li>
                <li>
                  <Link to="/agents">Agents</Link>
                </li>
                {currentUser && (
                  <li>
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                )}
              </ul>
              <button className="toggle-dark-mode" onClick={toggleDarkMode}>
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </nav>
          </header>
          <main className="main-content">
            <Route exact path="/" component={Home} />
            <Route path="/properties" component={Properties} />
            <Route path="/agents" component={Agents} />
            <Route path="/dashboard" component={Dashboard} />
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
      <p className="description">
        Find your dream home with our expert agents and wide range of properties.
      </p>
      <button className="call-to-action">
        <Link to="/properties">Explore Properties</Link>
      </button>
    </div>
  );
}

function Properties() {
  const [filteredProperties, setFilteredProperties] = useState(mockData.properties);

  const handleFilter = (event) => {
    const filterValue = event.target.value;
    const filteredProperties = mockData.properties.filter((property) => {
      return property.location.includes(filterValue);
    });
    setFilteredProperties(filteredProperties);
  };

  return (
    <div className="properties-container">
      <h1 className="title">Properties</h1>
      <input
        type="search"
        placeholder="Search by location"
        onChange={handleFilter}
        className="search-input"
      />
      <ul className="properties-list">
        {filteredProperties.map((property) => (
          <li key={property.id} className="property-card">
            <h2 className="property-title">{property.title}</h2>
            <p className="property-description">{property.description}</p>
            <p className="property-price">${property.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Agents() {
  return (
    <div className="agents-container">
      <h1 className="title">Agents</h1>
      <ul className="agents-list">
        {mockData.agents.map((agent) => (
          <li key={agent.id} className="agent-card">
            <h2 className="agent-name">{agent.name}</h2>
            <p className="agent-description">{agent.description}</p>
            <p className="agent-contact">{agent.contact}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="dashboard-container">
      <h1 className="title">Dashboard</h1>
      <p className="description">
        Welcome to your dashboard, where you can manage your properties and agents.
      </p>
      <button className="call-to-action">
        <Link to="/properties">Manage Properties</Link>
      </button>
      <button className="call-to-action">
        <Link to="/agents">Manage Agents</Link>
      </button>
    </div>
  );
}

export default App;