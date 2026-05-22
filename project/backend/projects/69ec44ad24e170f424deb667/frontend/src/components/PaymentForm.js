import React, { useState } from 'react';
import Cart from './Cart';

const PaymentForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const paymentData = {
      name,
      email,
      password,
      role,
      description,
      price,
      stock,
      category,
      subCategory,
      total,
      status,
      paymentMethod,
    };
    console.log(paymentData);
  };

  return (
    <div>
      <h1>Payment Form</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <br />
        <label>
          Email:
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <br />
        <label>
          Role:
          <input type="text" value={role} onChange={(event) => setRole(event.target.value)} />
        </label>
        <br />
        <label>
          Description:
          <input type="text" value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <br />
        <label>
          Price:
          <input type="number" value={price} onChange={(event) => setPrice(event.target.value)} />
        </label>
        <br />
        <label>
          Stock:
          <input type="number" value={stock} onChange={(event) => setStock(event.target.value)} />
        </label>
        <br />
        <label>
          Category:
          <input type="text" value={category} onChange={(event) => setCategory(event.target.value)} />
        </label>
        <br />
        <label>
          Sub Category:
          <input type="text" value={subCategory} onChange={(event) => setSubCategory(event.target.value)} />
        </label>
        <br />
        <label>
          Total:
          <input type="number" value={total} onChange={(event) => setTotal(event.target.value)} />
        </label>
        <br />
        <label>
          Status:
          <input type="text" value={status} onChange={(event) => setStatus(event.target.value)} />
        </label>
        <br />
        <label>
          Payment Method:
          <input type="text" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} />
        </label>
        <br />
        <input type="submit" value="Submit" />
      </form>
      <Cart />
    </div>
  );
};

export default PaymentForm;