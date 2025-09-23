import React, { useState, useEffect } from 'react';
import './RateLimitMonitor.css';

const RateLimitMonitor = () => {
  const [rateLimitStatus, setRateLimitStatus] = useState({
    auth: { remaining: 5, resetTime: null },
    standard: { remaining: 100, resetTime: null },
    read: { remaining: 60, resetTime: null },
    admin: { remaining: 30, resetTime: null }
  });
  const [testResults, setTestResults] = useState([]);

  // Function to test rate limiting
  const testRateLimit = async (endpoint, limiterType) => {
    const results = [];
    
    for (let i = 1; i <= 10; i++) {
      try {
        const response = await fetch(`http://localhost:4000${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const remaining = response.headers.get('X-RateLimit-Remaining');
        const resetTime = response.headers.get('X-RateLimit-Reset');
        
        results.push({
          request: i,
          status: response.status,
          remaining: remaining ? parseInt(remaining) : 'N/A',
          resetTime: resetTime ? new Date(parseInt(resetTime) * 1000).toLocaleTimeString() : 'N/A',
          success: response.ok
        });
        
        // Update rate limit status
        if (remaining) {
          setRateLimitStatus(prev => ({
            ...prev,
            [limiterType]: {
              remaining: parseInt(remaining),
              resetTime: resetTime ? new Date(parseInt(resetTime) * 1000) : null
            }
          }));
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        results.push({
          request: i,
          status: 'Error',
          remaining: 'N/A',
          resetTime: 'N/A',
          success: false,
          error: error.message
        });
      }
    }
    
    setTestResults(results);
  };

  // Test different endpoints
  const testAuthLimits = () => testRateLimit('/login', 'auth');
  const testStandardLimits = () => testRateLimit('/allproducts', 'standard');
  const testReadLimits = () => testRateLimit('/orders', 'read');
  const testAdminLimits = () => testRateLimit('/allusers', 'admin');

  return (
    <div className="rate-limit-monitor">
      <h2>Rate Limiting Monitor</h2>
      
      {/* Current Rate Limit Status */}
      <div className="status-grid">
        <div className="status-card">
          <h3>Auth Endpoints</h3>
          <p>Remaining: {rateLimitStatus.auth.remaining}</p>
          <p>Reset: {rateLimitStatus.auth.resetTime ? rateLimitStatus.auth.resetTime.toLocaleTimeString() : 'N/A'}</p>
        </div>
        
        <div className="status-card">
          <h3>Standard Endpoints</h3>
          <p>Remaining: {rateLimitStatus.standard.remaining}</p>
          <p>Reset: {rateLimitStatus.standard.resetTime ? rateLimitStatus.standard.resetTime.toLocaleTimeString() : 'N/A'}</p>
        </div>
        
        <div className="status-card">
          <h3>Read Endpoints</h3>
          <p>Remaining: {rateLimitStatus.read.remaining}</p>
          <p>Reset: {rateLimitStatus.read.resetTime ? rateLimitStatus.read.resetTime.toLocaleTimeString() : 'N/A'}</p>
        </div>
        
        <div className="status-card">
          <h3>Admin Endpoints</h3>
          <p>Remaining: {rateLimitStatus.admin.remaining}</p>
          <p>Reset: {rateLimitStatus.admin.resetTime ? rateLimitStatus.admin.resetTime.toLocaleTimeString() : 'N/A'}</p>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="test-buttons">
        <button onClick={testAuthLimits} className="test-btn auth">
          Test Auth Limits (5 req/15min)
        </button>
        <button onClick={testStandardLimits} className="test-btn standard">
          Test Standard Limits (100 req/15min)
        </button>
        <button onClick={testReadLimits} className="test-btn read">
          Test Read Limits (60 req/15min)
        </button>
        <button onClick={testAdminLimits} className="test-btn admin">
          Test Admin Limits (30 req/15min)
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="test-results">
          <h3>Test Results</h3>
          <div className="results-table">
            <table>
              <thead>
                <tr>
                  <th>Request #</th>
                  <th>Status</th>
                  <th>Remaining</th>
                  <th>Reset Time</th>
                  <th>Success</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((result, index) => (
                  <tr key={index} className={result.success ? 'success' : 'error'}>
                    <td>{result.request}</td>
                    <td>{result.status}</td>
                    <td>{result.remaining}</td>
                    <td>{result.resetTime}</td>
                    <td>{result.success ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rate Limit Information */}
      <div className="info-section">
        <h3>Rate Limiting Configuration</h3>
        <ul>
          <li><strong>Auth Endpoints:</strong> 5 requests per 15 minutes (login, signup)</li>
          <li><strong>Standard Endpoints:</strong> 100 requests per 15 minutes (general API)</li>
          <li><strong>Read Endpoints:</strong> 60 requests per 15 minutes (lists, aggregates)</li>
          <li><strong>Admin Endpoints:</strong> 30 requests per 15 minutes (admin management)</li>
          <li><strong>User-Aware:</strong> Authenticated users get individual limits instead of IP-based</li>
        </ul>
      </div>
    </div>
  );
};

export default RateLimitMonitor;
