import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SecureAuth.css';

const SecureAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      // Check for token in httpOnly cookie (more secure than localStorage)
      const token = getCookie('authToken');
      if (token) {
        // Verify token with backend
        verifyToken(token);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setLoading(false);
    }
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const setCookie = (name, value, days) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
  };

  const verifyToken = async (token) => {
    try {
      const response = await fetch('https://vehicle-sever.onrender.com/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        setIsAuthenticated(true);
      } else {
        // Token is invalid, remove it
        document.cookie = 'authToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
      }
    } catch (error) {
      console.error('Token verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch('https://vehicle-sever.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include' // Important for cookies
      });

      const data = await response.json();
      
      if (data.success) {
        // Store token in httpOnly cookie instead of localStorage
        setCookie('authToken', data.token, 1); // 1 day expiry
        setIsAuthenticated(true);
        setUser(data.user);
        navigate('/dashboard');
      } else {
        throw new Error(data.errors || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to OAuth endpoint
    window.location.href = 'https://vehicle-sever.onrender.com/auth/google';
  };

  const handleLogout = () => {
    // Clear cookie
    document.cookie = 'authToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="secure-auth">
      {isAuthenticated ? (
        <div className="user-info">
          <h3>Welcome, {user?.name}</h3>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      ) : (
        <div className="auth-options">
          <button onClick={handleGoogleLogin} className="google-login-btn">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
            Continue with Google
          </button>
          <div className="divider">or</div>
          <LoginForm onLogin={handleLogin} />
        </div>
      )}
    </div>
  );
};

const LoginForm = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(credentials);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={credentials.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" className="login-btn">
        Login
      </button>
    </form>
  );
};

export default SecureAuth;
