import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import mockData from './data/mockData';
import { AuthProvider } from './context/AuthContext';
import useLocalStorage from './hooks/useLocalStorage';

function App() {
  const [agents, setAgents] = useState(mockData.agents);
  const [listings, setListings] = useState(mockData.listings);
  const [leads, setLeads] = useState(mockData.leads);
  const [currentUser, setCurrentUser] = useLocalStorage('currentUser', null);

  const handleLogin = (agent) => {
    setCurrentUser(agent);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddListing = (newListing) => {
    setListings([...listings, newListing]);
  };

  const handleAddLead = (newLead) => {
    setLeads([...leads, newLead]);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/agents" element={<Agents agents={agents} handleLogin={handleLogin} />} />
          <Route path="/listings" element={<Listings listings={listings} handleAddListing={handleAddListing} />} />
          <Route path="/leads" element={<Leads leads={leads} handleAddLead={handleAddLead} />} />
          <Route path="/dashboard" element={<Dashboard currentUser={currentUser} listings={listings} leads={leads} handleLogout={handleLogout} />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function Home() {
  return (
    <div className="home">
      <h1>Welcome to MaiaHomes Real Estate Portal</h1>
      <Link to="/agents">Agents</Link>
      <Link to="/listings">Listings</Link>
      <Link to="/leads">Leads</Link>
    </div>
  );
}

function Agents({ agents, handleLogin }) {
  return (
    <div className="agents">
      <h1>Agents</h1>
      <ul>
        {agents.map((agent) => (
          <li key={agent.id}>
            <Link to={`/agents/${agent.id}`}>{agent.name}</Link>
            <button onClick={() => handleLogin(agent)}>Login</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Listings({ listings, handleAddListing }) {
  const [newListing, setNewListing] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    handleAddListing(newListing);
    setNewListing({});
  };

  return (
    <div className="listings">
      <h1>Listings</h1>
      <ul>
        {listings.map((listing) => (
          <li key={listing.id}>
            <Link to={`/listings/${listing.id}`}>{listing.title}</Link>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input type="text" value={newListing.title} onChange={(event) => setNewListing({ ...newListing, title: event.target.value })} placeholder="Title" />
        <input type="text" value={newListing.description} onChange={(event) => setNewListing({ ...newListing, description: event.target.value })} placeholder="Description" />
        <button type="submit">Add Listing</button>
      </form>
    </div>
  );
}

function Leads({ leads, handleAddLead }) {
  const [newLead, setNewLead] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    handleAddLead(newLead);
    setNewLead({});
  };

  return (
    <div className="leads">
      <h1>Leads</h1>
      <ul>
        {leads.map((lead) => (
          <li key={lead.id}>
            <Link to={`/leads/${lead.id}`}>{lead.name}</Link>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input type="text" value={newLead.name} onChange={(event) => setNewLead({ ...newLead, name: event.target.value })} placeholder="Name" />
        <input type="text" value={newLead.email} onChange={(event) => setNewLead({ ...newLead, email: event.target.value })} placeholder="Email" />
        <button type="submit">Add Lead</button>
      </form>
    </div>
  );
}

function Dashboard({ currentUser, listings, leads, handleLogout }) {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Welcome, {currentUser.name}!</p>
      <button onClick={handleLogout}>Logout</button>
      <h2>Listings</h2>
      <ul>
        {listings.map((listing) => (
          <li key={listing.id}>
            <Link to={`/listings/${listing.id}`}>{listing.title}</Link>
          </li>
        ))}
      </ul>
      <h2>Leads</h2>
      <ul>
        {leads.map((lead) => (
          <li key={lead.id}>
            <Link to={`/leads/${lead.id}`}>{lead.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;