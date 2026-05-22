import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import mockData from './data/mockData';

function App() {
  const [properties, setProperties] = useState(mockData.properties);
  const [filters, setFilters] = useState({
    location: '',
    price: '',
    type: '',
  });
  const [mapView, setMapView] = useState(false);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredProperties = properties.filter((property) => {
    return (
      (filters.location === '' || property.location.includes(filters.location)) &&
      (filters.price === '' || property.price <= filters.price) &&
      (filters.type === '' || property.type.includes(filters.type))
    );
  });

  return (
    <AuthProvider>
      <Router>
        <Switch>
          <Route path="/" exact>
            <div className="app-container">
              <nav className="glass-navbar">
                <Link to="/" className="nav-link">
                  MaiaHomes
                </Link>
                <Link to="/properties" className="nav-link">
                  Properties
                </Link>
              </nav>
              <div className="hero-section">
                <h1 className="hero-title">Find Your Dream Home</h1>
                <p className="hero-subtitle">Explore our collection of premium properties</p>
                <button className="hero-cta" onClick={() => setMapView(true)}>
                  View Properties
                </button>
              </div>
              {mapView && (
                <div className="map-view">
                  <div className="map-container">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.838251142997!2d-122.08405108497167!3d37.38534807932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fba02425dad6d%3A0xb9c9140b0c3c70e4!2sGoogleplex!5e0!3m2!1sen!2sus!4v1634216541421!5m2!1sen!2sus"
                      width="100%"
                      height="500"
                      frameBorder="0"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  </div>
                  <div className="filter-container">
                    <h2 className="filter-title">Filters</h2>
                    <form>
                      <label>
                        Location:
                        <input
                          type="text"
                          name="location"
                          value={filters.location}
                          onChange={handleFilterChange}
                        />
                      </label>
                      <label>
                        Price:
                        <input
                          type="number"
                          name="price"
                          value={filters.price}
                          onChange={handleFilterChange}
                        />
                      </label>
                      <label>
                        Type:
                        <select name="type" value={filters.type} onChange={handleFilterChange}>
                          <option value="">All</option>
                          <option value="Residential">Residential</option>
                          <option value="Commercial">Commercial</option>
                        </select>
                      </label>
                    </form>
                  </div>
                  <div className="property-list">
                    {filteredProperties.map((property) => (
                      <div key={property.id} className="property-card">
                        <h2 className="property-title">{property.title}</h2>
                        <p className="property-description">{property.description}</p>
                        <p className="property-price">${property.price}</p>
                        <p className="property-location">{property.location}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Route>
          <Route path="/properties">
            <div className="property-list-page">
              <h1 className="property-list-title">Properties</h1>
              <div className="property-list">
                {properties.map((property) => (
                  <div key={property.id} className="property-card">
                    <h2 className="property-title">{property.title}</h2>
                    <p className="property-description">{property.description}</p>
                    <p className="property-price">${property.price}</p>
                    <p className="property-location">{property.location}</p>
                  </div>
                ))}
              </div>
            </div>
          </Route>
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;