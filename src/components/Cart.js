import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, doc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Check stock availability for all items
      for (const item of cart) {
        const productRef = doc(db, 'products', item.id);
        const productDoc = await getDoc(productRef);
        
        if (!productDoc.exists()) {
          setError(`Product ${item.name || item.title || 'unknown'} is no longer available.`);
          return;
        }
        
        const currentStock = productDoc.data().stock;
        if (currentStock < item.quantity) {
          setError(`Not enough stock available for ${item.name || item.title || 'unknown'}. Available: ${currentStock}`);
          return;
        }
      }

      const shippingAddress = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}`;
      
      // Use a transaction to update stock and create order
      await runTransaction(db, async (transaction) => {
        // Create the order
        const orderRef = await addDoc(collection(db, 'orders'), {
          items: cart,
          total: calculateTotal(),
          customerEmail: currentUser.email,
          customerName: shippingInfo.name,
          shippingAddress,
          phone: shippingInfo.phone,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: currentUser.uid
        });

        // Update stock for each item
        for (const item of cart) {
          const productRef = doc(db, 'products', item.id);
          const productDoc = await transaction.get(productRef);
          const newStock = productDoc.data().stock - item.quantity;
          
          transaction.update(productRef, { stock: newStock });
        }
      });

      // Clear the cart and show success message
      cart.forEach(item => removeFromCart(item.id));
      alert('Order placed successfully! You can track your order in the My Orders section.');
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      setError('There was an error processing your order. Please try again.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <h2>Shopping Cart</h2>
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/')} className="continue-shopping">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>Shopping Cart</h2>
      {error && <div className="error-message">{error}</div>}
      {!showCheckout ? (
        <>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name || item.title} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3>{item.name || item.title}</h3>
                  <p className="cart-item-price">${item.price}</p>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="remove-item"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div className="cart-total">
              <span>Total</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <button
              className="checkout-button"
              onClick={() => setShowCheckout(true)}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      ) : (
        <div className="checkout-form">
          <h3>Shipping Information</h3>
          <form onSubmit={handleCheckout}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={shippingInfo.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={shippingInfo.address}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={shippingInfo.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={shippingInfo.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="order-summary">
              <h4>Order Summary</h4>
              <div className="summary-items">
                {cart.map(item => (
                  <div key={item.id} className="summary-item">
                    <span>{item.name || item.title} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            <div className="checkout-buttons">
              <button
                type="button"
                className="back-btn"
                onClick={() => setShowCheckout(false)}
              >
                Back to Cart
              </button>
              <button type="submit" className="place-order-btn">
                Place Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Cart; 