import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import User from '../models/User';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      const response = await User.find({ role: 'admin' });
      const payments = response.filter((user) => user.total !== 0);
      setPayments(payments);
    };
    fetchPayments();
  }, []);

  const handleStatusChange = async (id, status) => {
    await User.findByIdAndUpdate(id, { status: status });
    const response = await User.find({ role: 'admin' });
    const payments = response.filter((user) => user.total !== 0);
    setPayments(payments);
  };

  return (
    <Dashboard>
      <h1>Payment List</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Total</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment._id}>
              <td>{payment.name}</td>
              <td>{payment.email}</td>
              <td>{payment.total}</td>
              <td>{payment.paymentMethod}</td>
              <td>{payment.status}</td>
              <td>
                {payment.status === 'pending' ? (
                  <button onClick={() => handleStatusChange(payment._id, 'approved')}>Approve</button>
                ) : (
                  <button onClick={() => handleStatusChange(payment._id, 'pending')}>Reject</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Dashboard>
  );
};

export default PaymentList;