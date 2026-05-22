#root {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #333;
    color: #fff;
    padding: 1em;
    text-align: center;
}

nav a {
    color: #fff;
    text-decoration: none;
    margin: 0 1em;
}

.home {
    background-color: #f0f0f0;
    padding: 2em;
    text-align: center;
}

.dashboard {
    background-color: #f0f0f0;
    padding: 2em;
    text-align: center;
}

// script.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom';
import Home from './Home.js';
import Dashboard from './Dashboard.js';

ReactDOM.render(
    <BrowserRouter>
        <nav>
            <a href="/">Home</a>
            <a href="/dashboard">Dashboard</a>
        </nav>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
    </BrowserRouter>,
    document.getElementById('root')
);

// Home.js
import React from 'react';

function Home() {
    return (
        <div className="home">
            <h1>Welcome to Online Library Website System</h1>
            <p>This is the home page.</p>
        </div>
    );
}

export default Home;

// Dashboard.js
import React from 'react';

function Dashboard() {
    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <p>This is the dashboard page.</p>
        </div>
    );
}

export default Dashboard;