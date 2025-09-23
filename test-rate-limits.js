// Test script for rate limiting
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testRateLimit(endpoint, maxRequests = 10, delay = 100) {
  console.log(`\n🧪 Testing rate limit for ${endpoint}`);
  console.log('=' .repeat(50));
  
  for (let i = 1; i <= maxRequests; i++) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        timeout: 5000,
        validateStatus: () => true // Don't throw on HTTP error status
      });
      
      const remaining = response.headers['x-ratelimit-remaining'];
      const resetTime = response.headers['x-ratelimit-reset'];
      const limit = response.headers['x-ratelimit-limit'];
      
      console.log(`Request ${i.toString().padStart(2)}: Status ${response.status} | Remaining: ${remaining || 'N/A'} | Limit: ${limit || 'N/A'}`);
      
      if (response.status === 429) {
        console.log(`🚫 Rate limit exceeded at request ${i}`);
        if (resetTime) {
          const resetDate = new Date(parseInt(resetTime) * 1000);
          console.log(`⏰ Reset time: ${resetDate.toLocaleString()}`);
        }
        break;
      }
      
      // Small delay between requests
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
    } catch (error) {
      console.log(`Request ${i}: Error - ${error.message}`);
    }
  }
}

async function testAllEndpoints() {
  console.log('🚀 Starting Rate Limit Tests');
  console.log('Make sure your server is running on http://localhost:4000');
  
  // Test different endpoint types
  await testRateLimit('/allproducts', 15, 200);  // Read limiter (60 req/15min)
  await testRateLimit('/orders', 15, 200);       // Read limiter (60 req/15min)
  await testRateLimit('/allusers', 10, 200);     // Admin limiter (30 req/15min)
  
  // Test auth endpoints (should limit at 5)
  console.log('\n🔐 Testing Auth Endpoints (should limit at 5 requests)');
  for (let i = 1; i <= 7; i++) {
    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        email: 'test@test.com',
        password: 'wrongpassword'
      }, {
        timeout: 5000,
        validateStatus: () => true
      });
      
      const remaining = response.headers['x-ratelimit-remaining'];
      console.log(`Auth Request ${i}: Status ${response.status} | Remaining: ${remaining || 'N/A'}`);
      
      if (response.status === 429) {
        console.log(`🚫 Auth rate limit exceeded at request ${i}`);
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.log(`Auth Request ${i}: Error - ${error.message}`);
    }
  }
  
  console.log('\n✅ Rate limit testing completed!');
}

// Run the tests
testAllEndpoints().catch(console.error);
