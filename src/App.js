import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { initializeCategories } from './utils/initializeCategories';
import AdminSetup from './components/AdminSetup';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import Profile from './components/Profile';
import PrivateRoute from './components/PrivateRoute';
import MyOrders from './components/MyOrders';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    initializeCategories();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="app">
            <Navbar onSearch={handleSearch} />
            <div className="app-content">
              <Routes>
                <Route path="/" element={<Home searchQuery={searchQuery} />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin-setup" element={<AdminSetup />} />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute>
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/my-orders"
                  element={
                    <PrivateRoute>
                      <MyOrders />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </div>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
