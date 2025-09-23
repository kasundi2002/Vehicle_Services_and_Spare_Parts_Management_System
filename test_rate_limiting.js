const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test function to make multiple requests
async function testRateLimit(endpoint, maxRequests = 25, delay = 100) {
    console.log(`\n🧪 Testing rate limiting for: ${endpoint}`);
    console.log(`📊 Making ${maxRequests} requests with ${delay}ms delay...\n`);
    
    const results = [];
    
    for (let i = 1; i <= maxRequests; i++) {
        try {
            const startTime = Date.now();
            const response = await axios.get(`${BASE_URL}${endpoint}`, {
                timeout: 5000,
                validateStatus: () => true // Don't throw on HTTP error status
            });
            const endTime = Date.now();
            
            const result = {
                request: i,
                status: response.status,
                headers: response.headers,
                responseTime: endTime - startTime,
                rateLimitRemaining: response.headers['x-ratelimit-remaining'],
                rateLimitReset: response.headers['x-ratelimit-reset']
            };
            
            results.push(result);
            
            console.log(`Request ${i.toString().padStart(2, '0')}: Status ${response.status} | Remaining: ${result.rateLimitRemaining || 'N/A'} | Time: ${result.responseTime}ms`);
            
            // Check if we hit rate limit
            if (response.status === 429) {
                console.log(`🚨 RATE LIMIT HIT at request ${i}!`);
                console.log(`📋 Rate limit info:`, {
                    remaining: result.rateLimitRemaining,
                    reset: result.rateLimitReset,
                    retryAfter: response.headers['retry-after']
                });
                break;
            }
            
            await new Promise(resolve => setTimeout(resolve, delay));
            
        } catch (error) {
            console.log(`Request ${i}: ERROR - ${error.message}`);
            results.push({
                request: i,
                error: error.message,
                status: 'ERROR'
            });
        }
    }
    
    return results;
}

// Test different endpoints with different rate limits
async function runAllTests() {
    console.log('🚀 Starting Rate Limiting Vulnerability Tests\n');
    console.log('=' .repeat(60));
    
    try {
        // Test 1: Basic server response
        console.log('\n1️⃣ Testing basic server connectivity...');
        const basicTest = await axios.get(BASE_URL);
        console.log(`✅ Server is running: ${basicTest.data}`);
        
        // Test 2: Read-heavy endpoints (should have readLimiter - 60 requests/15min)
        console.log('\n2️⃣ Testing READ endpoints (readLimiter: 60 req/15min)');
        await testRateLimit('/allproducts', 25, 200);
        
        // Test 3: Admin endpoints (should have adminLimiter - 30 requests/15min)  
        console.log('\n3️⃣ Testing ADMIN endpoints (adminLimiter: 30 req/15min)');
        await testRateLimit('/allusers', 25, 200);
        
        // Test 4: Write endpoints (should have standardLimiter - 20 requests/15min)
        console.log('\n4️⃣ Testing WRITE endpoints (standardLimiter: 20 req/15min)');
        await testRateLimit('/upload', 25, 200);
        
        // Test 5: Aggregate endpoints (should have readLimiter)
        console.log('\n5️⃣ Testing AGGREGATE endpoints (readLimiter: 60 req/15min)');
        await testRateLimit('/totalAmountOfOrders', 25, 200);
        
        console.log('\n✅ All tests completed!');
        console.log('\n📊 Rate Limiting Test Summary:');
        console.log('- readLimiter: 60 requests per 15 minutes');
        console.log('- adminLimiter: 30 requests per 15 minutes'); 
        console.log('- standardLimiter: 20 requests per 15 minutes');
        console.log('\n🔒 If you see 429 status codes, rate limiting is working!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the tests
runAllTests();
