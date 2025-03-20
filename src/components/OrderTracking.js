import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './OrderTracking.css';

function OrderTracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadUserOrders();
  }, [currentUser]);

  const loadUserOrders = async () => {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('customerEmail', '==', currentUser.email)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="tracking-loading">Loading your orders...</div>;
  }

  return (
    <div className="order-tracking">
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="tracking-card">
              <div className="tracking-header">
                <div className="order-info">
                  <h2>Order #{order.id.slice(-6)}</h2>
                  <p className="order-date">
                    Ordered on {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="order-status">
                  <span className={`status-badge ${order.status?.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="timeline-container">
                <div className="timeline-steps">
                  <div className={`timeline-step ${order.status === 'pending' ? 'current' : ''} ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                    <div className="step-indicator"></div>
                    <span>Order Placed</span>
                    <small>{order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString() : ''}</small>
                  </div>
                  <div className={`timeline-step ${order.status === 'processing' ? 'current' : ''} ${['shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                    <div className="step-indicator"></div>
                    <span>Processing</span>
                  </div>
                  <div className={`timeline-step ${order.status === 'shipped' ? 'current' : ''} ${['delivered'].includes(order.status) ? 'completed' : ''}`}>
                    <div className="step-indicator"></div>
                    <span>Shipped</span>
                  </div>
                  <div className={`timeline-step ${order.status === 'delivered' ? 'current' : ''}`}>
                    <div className="step-indicator"></div>
                    <span>Delivered</span>
                  </div>
                </div>
              </div>

              <div className="order-details">
                <div className="shipping-info">
                  <h3>Shipping Details</h3>
                  <p>{order.shippingAddress}</p>
                </div>

                <div className="order-items">
                  <h3>Order Items</h3>
                  {order.items?.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-info">
                        <span className="item-title">{item.title}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                      </div>
                      <span className="item-price">${item.price}</span>
                    </div>
                  ))}
                  <div className="order-total">
                    <span>Total</span>
                    <span>${order.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderTracking; 