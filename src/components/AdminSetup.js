import React, { useState } from 'react';
import { setupAdmin } from '../utils/adminSetup';
import './AdminSetup.css';

const AdminSetup = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetupAdmin = async () => {
    setLoading(true);
    try {
      const success = await setupAdmin('admin@example.com');
      if (success) {
        setMessage('Admin role has been set successfully! Please log out and log back in.');
      } else {
        setMessage('Failed to set admin role. User not found.');
      }
    } catch (error) {
      setMessage('Error setting up admin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-setup">
      <h2>Admin Setup</h2>
      {message && <div className="message">{message}</div>}
      <button 
        onClick={handleSetupAdmin}
        disabled={loading}
        className="setup-button"
      >
        {loading ? 'Setting up...' : 'Setup Admin'}
      </button>
    </div>
  );
};

export default AdminSetup; 