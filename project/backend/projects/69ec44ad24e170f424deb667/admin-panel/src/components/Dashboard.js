import React from 'react';
import Login from './Login';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Panel Dashboard</h1>
      </div>
      <div className="dashboard-content">
        <Login />
      </div>
    </div>
  );
};

export default Dashboard;