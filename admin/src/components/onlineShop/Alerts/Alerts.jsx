import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';
import './Alerts.css'

const Alerts = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [processingCount, setProcessingCount] = useState([]);

  useEffect(() => {
    // Fetch low stock products
    axios.get('https://vehicle-sever.onrender.com/lowStockProducts')
      .then(response => {
        const { products, lowStockProducts } = response.data;
        setLowStockProducts(lowStockProducts);
        if (lowStockProducts && lowStockProducts.length > 0) {
          alert(`Attention: ${lowStockProducts.length} product(s) have low stock.`);
        }
      })
      .catch(error => {
        console.error('Error fetching low stock products:', error);
      });

    // Fetch processing orders count
    axios.get('https://vehicle-sever.onrender.com/processingOrdersCount')
      .then(response => {
        const { processingOrdersCount } = response.data;
        setProcessingCount(processingOrdersCount);
      })
      .catch(error => {
        console.error('Error fetching processing orders count:', error);
      });
  }, []);

  return (
    <div className="alerts-container">
      <Navbar />
      <div className='alert-section'>
        <div className="low-stock-section">
          <h2>Low Stock Products</h2>
          <ul>
            {lowStockProducts.map(product => (
              <li key={product.id}>{product.name} - Quantity: {product.quantity}</li>
            ))}
          </ul>
        </div>
        <div className="processing-orders-section">
          <h2>You Have {processingCount.length} Orders to Ship</h2>
          <ul>
            {processingCount.map(order => (
              <li key={order.orderId} className="order-details">
                <div>Order ID: {order.orderId}</div>
                <div>Customer Name: {order.fullName}</div>
                <div>
                  Items:
                  <ul className="item-list">
                    {order.items.map((item, index) => (
                      <li key={index} className="item">
                        Item ID: {item.productId} - Quantity: {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  Order Date: {new Date(order.orderDate).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
