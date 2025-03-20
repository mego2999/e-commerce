import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      // Wait for login to complete
      const userCredential = await login(email, password);
      
      // Get user data from Firestore to make sure everything is up-to-date
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        // Small delay to ensure context updates
        setTimeout(() => {
          navigate('/');
        }, 100);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to sign in');
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      // Wait for Google login to complete
      const userCredential = await loginWithGoogle();
      
      // Get user data from Firestore to make sure everything is up-to-date
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        // Small delay to ensure context updates
        setTimeout(() => {
          navigate('/');
        }, 100);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Failed to sign in with Google');
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button disabled={loading} type="submit" className="login-button">
            Login
          </button>
        </form>
        <div className="divider">
          <span>OR</span>
        </div>
        <button 
          onClick={handleGoogleSignIn} 
          disabled={loading} 
          className="google-button"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="google-icon" />
          Sign in with Google
        </button>
        <div className="auth-links">
          <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login; 