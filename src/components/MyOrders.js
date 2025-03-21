import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import './MyOrders.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid)
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="my-orders-container">
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p className="no-orders">You haven't placed any orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>Order #{order.id.slice(0, 8)}</h3>
                <span className="order-date">
                  {order.createdAt instanceof Date 
                    ? order.createdAt.toLocaleDateString() 
                    : order.createdAt?.toDate 
                      ? order.createdAt.toDate().toLocaleDateString()
                      : new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img src={item.image} alt={item.name || item.title} />
                    <div className="item-details">
                      <h4>{item.name || item.title}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ${parseFloat(item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-footer">
                <p className="order-total">Total: ${parseFloat(order.total).toFixed(2)}</p>
                <p className="order-status">Status: <span className={`status-${order.status}`}>{order.status}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders; 