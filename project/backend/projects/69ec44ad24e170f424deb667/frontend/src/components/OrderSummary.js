import React from 'react';
import PaymentForm from './PaymentForm';

const OrderSummary = ({ products, total, paymentMethod }) => {
  return (
    <div className="order-summary">
      <h2>Order Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.name}>
              <td>{product.name}</td>
              <td>{product.price}</td>
              <td>1</td>
              <td>{product.price}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3">Subtotal</td>
            <td>{total}</td>
          </tr>
          <tr>
            <td colSpan="3">Payment Method</td>
            <td>{paymentMethod}</td>
          </tr>
        </tfoot>
      </table>
      <PaymentForm total={total} paymentMethod={paymentMethod} />
    </div>
  );
};

export default OrderSummary;