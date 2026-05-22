import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import mockData from './data/mockData';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useLocalStorage('currentUser', null);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Header handleSidebarToggle={handleSidebarToggle} />
          <Sidebar sidebarOpen={sidebarOpen} handleSidebarToggle={handleSidebarToggle} />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

function Header({ handleSidebarToggle }) {
  return (
    <header className="header">
      <div className="header-logo">
        <h1>MaiaHomes</h1>
      </div>
      <div className="header-nav">
        <button className="header-nav-button" onClick={handleSidebarToggle}>
          <i className="fas fa-bars"></i>
        </button>
      </div>
    </header>
  );
}

function Sidebar({ sidebarOpen, handleSidebarToggle }) {
  return (
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <h2>Menu</h2>
        <button className="sidebar-close-button" onClick={handleSidebarToggle}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      <ul className="sidebar-menu">
        <li>
          <a href="#">Dashboard</a>
        </li>
        <li>
          <a href="#">Listings</a>
        </li>
        <li>
          <a href="#">About</a>
        </li>
      </ul>
    </aside>
  );
}

function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-cards">
        {mockData.listings.map((listing) => (
          <div key={listing.id} className="dashboard-card">
            <h2>{listing.title}</h2>
            <p>{listing.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Listings() {
  return (
    <div className="listings">
      <h1>Listings</h1>
      <div className="listings-grid">
        {mockData.listings.map((listing) => (
          <div key={listing.id} className="listing-card">
            <h2>{listing.title}</h2>
            <p>{listing.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="about">
      <h1>About</h1>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet nulla auctor, vestibulum magna sed, convallis ex.
      </p>
    </div>
  );
}

export default App;