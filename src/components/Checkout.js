import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { db } from '../firebase/config';
import { doc, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cart, clearCart, getCartTotal } = useCart();
  const [loading, setLoading] = useState(true);
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    zipCode: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }
    loadUserProfile();
  }, [cart, navigate]);

  const loadUserProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setShippingDetails(prev => ({
          ...prev,
          fullName: userData.displayName || '',
          email: currentUser.email,
          phone: userData.phoneNumber || '',
          address: userData.address || '',
          city: userData.city || '',
          country: userData.country || ''
        }));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    for (const [key, value] of Object.entries(shippingDetails)) {
      if (!value.trim()) {
        setError(`Please fill in your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    try {
      setLoading(true);
      
      // Create order in Firestore
      const orderData = {
        userId: currentUser.uid,
        items: cart,
        total: getCartTotal(),
        shippingDetails,
        status: 'Pending',
        createdAt: new Date()
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);

      // Update user profile with shipping details
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName: shippingDetails.fullName,
        phoneNumber: shippingDetails.phone,
        address: shippingDetails.address,
        city: shippingDetails.city,
        country: shippingDetails.country
      });

      // Clear cart and redirect to order confirmation
      clearCart();
      navigate(`/order-confirmation/${orderRef.id}`);
    } catch (error) {
      console.error('Error processing order:', error);
      setError('Failed to process your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="checkout-loading">Loading checkout...</div>;
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      
      <div className="checkout-grid">
        <div className="shipping-details">
          <h2>Shipping Details</h2>
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={shippingDetails.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={shippingDetails.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={shippingDetails.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={shippingDetails.address}
                onChange={handleInputChange}
                placeholder="Enter your address"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={shippingDetails.city}
                  onChange={handleInputChange}
                  placeholder="Enter your city"
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={shippingDetails.country}
                  onChange={handleInputChange}
                  placeholder="Enter your country"
                />
              </div>
            </div>

            <div className="form-group">
              <label>ZIP Code</label>
              <input
                type="text"
                name="zipCode"
                value={shippingDetails.zipCode}
                onChange={handleInputChange}
                placeholder="Enter your ZIP code"
              />
            </div>

            {error && <div className="error-message">{error}</div>}
          </form>
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-items">
            {cart.map((item, index) => (
              <div key={index} className="summary-item">
                <div className="item-info">
                  <span className="item-name">{item.title}</span>
                  <span className="item-quantity">x{item.quantity}</span>
                </div>
                <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="summary-total">
            <div className="subtotal">
              <span>Subtotal</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="shipping">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="total">
              <span>Total</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
          </div>

          <button 
            type="submit" 
            className="place-order-button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout; 