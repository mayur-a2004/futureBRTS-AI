import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import PropertySearch from './pages/PropertySearch';
import PropertyDetails from './pages/PropertyDetails';
import PropertyComparison from './pages/PropertyComparison';
import Testimonials from './pages/Testimonials';
import InteractiveMaps from './pages/InteractiveMaps';
import HighQualityImages from './pages/HighQualityImages';
import CallToActionButtons from './pages/CallToActionButtons';
import ResponsiveDesign from './pages/ResponsiveDesign';
import UserFriendlyNavigation from './pages/UserFriendlyNavigation';

function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.example.com/api/landing');
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      const response = await fetch(`${apiBaseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const handlePropertySearch = async (query) => {
    try {
      const response = await fetch(`${apiBaseUrl}/properties`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        params: { query },
      });
      const data = await response.json();
      setProperties(data.properties);
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePropertyDetails = async (id) => {
    try {
      const response = await fetch(`${apiBaseUrl}/properties/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setProperties([data.property]);
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePropertyComparison = async (ids) => {
    try {
      const response = await fetch(`${apiBaseUrl}/properties/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });
      const data = await response.json();
      setProperties(data.properties);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Header user={user} handleLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login handleLogin={handleLogin} />} />
          <Route path="/register" element={<Register handleRegister={handleRegister} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/property-search" element={<PropertySearch handlePropertySearch={handlePropertySearch} />} />
          <Route path="/property-details/:id" element={<PropertyDetails handlePropertyDetails={handlePropertyDetails} />} />
          <Route path="/property-comparison" element={<PropertyComparison handlePropertyComparison={handlePropertyComparison} />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/interactive-maps" element={<InteractiveMaps />} />
          <Route path="/high-quality-images" element={<HighQualityImages />} />
          <Route path="/call-to-action-buttons" element={<CallToActionButtons />} />
          <Route path="/responsive-design" element={<ResponsiveDesign />} />
          <Route path="/user-friendly-navigation" element={<UserFriendlyNavigation />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;