import React, { useState, useEffect } from 'react';
import Dashboard from '../Dashboard';
import { User } from '../models/User';
import { database } from '../../../backend/config/database';

const AnalyticsList = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await database.collection('orders').find().toArray();
        setAnalytics(response);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAnalytics();
  }, []);

  const columns = [
    { field: 'name', headerName: 'Product Name', width: 200 },
    { field: 'email', headerName: 'Customer Email', width: 200 },
    { field: 'total', headerName: 'Total', width: 100 },
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'paymentMethod', headerName: 'Payment Method', width: 150 },
    { field: 'createdAt', headerName: 'Created At', width: 200 },
  ];

  return (
    <Dashboard>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ height: 400, width: '100%' }}>
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.field}>{column.headerName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analytics.map((analytic) => (
                <tr key={analytic._id}>
                  {columns.map((column) => (
                    <td key={column.field}>{analytic[column.field]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Dashboard>
  );
};

export default AnalyticsList;