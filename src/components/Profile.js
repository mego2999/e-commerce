import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import './Profile.css';

function Profile() {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    phoneNumber: '',
    address: '',
    city: '',
    country: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    loadUserProfile();
    loadOrders();
  }, [currentUser]);

  const loadUserProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserProfile({
          displayName: userDoc.data().displayName || '',
          phoneNumber: userDoc.data().phoneNumber || '',
          address: userDoc.data().address || '',
          city: userDoc.data().city || '',
          country: userDoc.data().country || '',
        });
      }
    } catch (error) {
      setMessage({ text: 'Error loading profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), userProfile);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ text: 'Error updating profile', type: 'error' });
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="profile-email">{currentUser.email}</div>
      </div>

      <div className="profile-sections">
        <section className="personal-info-section">
          <h2>Personal Information</h2>
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="displayName"
                value={userProfile.displayName}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={userProfile.phoneNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={userProfile.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your address"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={userProfile.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your city"
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={userProfile.country}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your country"
                />
              </div>
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button type="submit" className="save-button">Save Changes</button>
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => {
                      setIsEditing(false);
                      loadUserProfile();
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  type="button" 
                  className="edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </form>

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
        </section>

        <section className="orders-section">
          <h2>Order History</h2>
          {orders.length === 0 ? (
            <div className="no-orders">No orders yet</div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <span className="order-id">Order #{order.id.slice(-6)}</span>
                    <span className="order-date">
                      {new Date(order.createdAt?.toDate()).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-total">
                    <span>Total:</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                  <div className="order-status">
                    Status: <span className={`status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Profile; 