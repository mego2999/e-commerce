import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import './Navbar.css';

const Navbar = ({ onSearch }) => {
  const { currentUser, logout, userRole } = useAuth();
  const { getCartItemCount } = useCart();
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Update cart count whenever it might change
  useEffect(() => {
    setCartItemsCount(getCartItemCount());
  }, [getCartItemCount, currentUser, location]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Check if user is admin
  const isAdmin = currentUser?.isAdmin === true || currentUser?.role === 'admin';

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">My Shop</Link>
      </div>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        
        {currentUser ? (
          <>
            {isAdmin && (
              <>
                <Link to="/admin" className="nav-link">Admin Dashboard</Link>
                <Link to="/admin-products" className="nav-link">Manage Products</Link>
              </>
            )}
            <Link to="/cart" className="nav-link">
              Cart ({cartItemsCount})
            </Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 