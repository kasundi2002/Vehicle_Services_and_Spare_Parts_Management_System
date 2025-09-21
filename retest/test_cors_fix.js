#!/usr/bin/env node

/**
 * CORS Fix Demonstration Script
 * 
 * This script demonstrates the CORS security fix by testing various scenarios
 * and showing the before/after behavior.
 */

const http = require('http');
const https = require('https');

// Test configuration
const SERVER_URL = 'http://localhost:4000';
const TEST_ENDPOINTS = [
    '/allproducts',
    '/login',
    '/addproduct'
];

const TEST_ORIGINS = [
    { origin: 'http://localhost:3000', expected: 'ALLOWED', description: 'Client React App' },
    { origin: 'http://localhost:5173', expected: 'ALLOWED', description: 'Admin Vite App' },
    { origin: 'https://trusted-domain.com', expected: 'ALLOWED', description: 'Trusted Domain' },
    { origin: 'https://malicious-site.com', expected: 'BLOCKED', description: 'Malicious Site' },
    { origin: 'http://evil.com', expected: 'BLOCKED', description: 'Evil Domain' },
    { origin: 'https://attacker.com', expected: 'BLOCKED', description: 'Attacker Domain' }
];

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, origin = null) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                'User-Agent': 'CORS-Test-Script/1.0'
            }
        };

        if (origin) {
            options.headers['Origin'] = origin;
        }

        const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

function testCorsOrigin(origin, endpoint) {
    return makeRequest(`${SERVER_URL}${endpoint}`, origin.origin)
        .then(response => {
            const corsHeader = response.headers['access-control-allow-origin'];
            const hasCredentials = response.headers['access-control-allow-credentials'];
            
            return {
                origin: origin.origin,
                description: origin.description,
                expected: origin.expected,
                statusCode: response.statusCode,
                corsHeader: corsHeader,
                hasCredentials: hasCredentials,
                success: origin.expected === 'ALLOWED' ? 
                    (corsHeader === origin.origin && hasCredentials === 'true') :
                    (response.statusCode >= 400 || !corsHeader)
            };
        })
        .catch(error => {
            return {
                origin: origin.origin,
                description: origin.description,
                expected: origin.expected,
                statusCode: 'ERROR',
                corsHeader: null,
                hasCredentials: null,
                success: origin.expected === 'BLOCKED',
                error: error.message
            };
        });
}

async function runCorsTests() {
    log('\n🔒 CORS Security Fix Demonstration', 'bold');
    log('=====================================', 'blue');
    
    log('\n📋 Test Configuration:', 'yellow');
    log(`Server: ${SERVER_URL}`, 'blue');
    log(`Endpoints: ${TEST_ENDPOINTS.join(', ')}`, 'blue');
    log(`Origins: ${TEST_ORIGINS.length} test cases`, 'blue');
    
    log('\n🧪 Running CORS Tests...', 'yellow');
    log('========================', 'blue');
    
    const results = [];
    
    for (const endpoint of TEST_ENDPOINTS) {
        log(`\n📍 Testing Endpoint: ${endpoint}`, 'bold');
        log('─'.repeat(50), 'blue');
        
        for (const origin of TEST_ORIGINS) {
            try {
                const result = await testCorsOrigin(origin, endpoint);
                results.push({ ...result, endpoint });
                
                const status = result.success ? '✅ PASS' : '❌ FAIL';
                const statusColor = result.success ? 'green' : 'red';
                
                log(`\n${status} ${origin.description}`, statusColor);
                log(`   Origin: ${origin.origin}`, 'blue');
                log(`   Expected: ${origin.expected}`, 'blue');
                log(`   Status: ${result.statusCode}`, 'blue');
                log(`   CORS Header: ${result.corsHeader || 'None'}`, 'blue');
                log(`   Credentials: ${result.hasCredentials || 'None'}`, 'blue');
                
                if (result.error) {
                    log(`   Error: ${result.error}`, 'red');
                }
                
            } catch (error) {
                log(`\n❌ ERROR ${origin.description}`, 'red');
                log(`   Origin: ${origin.origin}`, 'blue');
                log(`   Error: ${error.message}`, 'red');
            }
        }
    }
    
    // Summary
    log('\n📊 Test Summary', 'bold');
    log('===============', 'blue');
    
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    const passRate = ((passed / total) * 100).toFixed(1);
    
    log(`\nTotal Tests: ${total}`, 'blue');
    log(`Passed: ${passed}`, 'green');
    log(`Failed: ${total - passed}`, 'red');
    log(`Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'red');
    
    // Security Analysis
    log('\n🔐 Security Analysis', 'bold');
    log('===================', 'blue');
    
    const allowedOrigins = results.filter(r => r.expected === 'ALLOWED' && r.success);
    const blockedOrigins = results.filter(r => r.expected === 'BLOCKED' && r.success);
    
    log(`\n✅ Allowed Origins Working: ${allowedOrigins.length}/${TEST_ORIGINS.filter(o => o.expected === 'ALLOWED').length}`, 'green');
    log(`✅ Blocked Origins Working: ${blockedOrigins.length}/${TEST_ORIGINS.filter(o => o.expected === 'BLOCKED').length}`, 'green');
    
    if (allowedOrigins.length > 0) {
        log('\n📝 Allowed Origins:', 'green');
        allowedOrigins.forEach(r => {
            log(`   - ${r.origin} (${r.description})`, 'green');
        });
    }
    
    if (blockedOrigins.length > 0) {
        log('\n🚫 Blocked Origins:', 'red');
        blockedOrigins.forEach(r => {
            log(`   - ${r.origin} (${r.description})`, 'red');
        });
    }
    
    // Recommendations
    log('\n💡 Recommendations', 'bold');
    log('==================', 'blue');
    
    if (passRate >= 90) {
        log('✅ CORS configuration is working correctly!', 'green');
    } else if (passRate >= 70) {
        log('⚠️  CORS configuration needs minor adjustments', 'yellow');
    } else {
        log('❌ CORS configuration has significant issues', 'red');
    }
    
    log('\n🔧 Next Steps:', 'yellow');
    log('1. Verify server is running on port 4000', 'blue');
    log('2. Check ALLOWED_ORIGINS environment variable', 'blue');
    log('3. Review server logs for CORS warnings', 'blue');
    log('4. Run integration tests: npm run test:cors', 'blue');
    
    log('\n✨ CORS Security Fix Demonstration Complete!', 'bold');
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    log('\nCORS Fix Test Script', 'bold');
    log('===================', 'blue');
    log('\nUsage: node test_cors_fix.js [options]', 'blue');
    log('\nOptions:', 'yellow');
    log('  --help, -h    Show this help message', 'blue');
    log('  --url <url>   Test against specific server URL', 'blue');
    log('\nExamples:', 'yellow');
    log('  node test_cors_fix.js', 'blue');
    log('  node test_cors_fix.js --url http://localhost:3000', 'blue');
    process.exit(0);
}

// Parse URL argument
const urlIndex = process.argv.indexOf('--url');
if (urlIndex !== -1 && process.argv[urlIndex + 1]) {
    SERVER_URL = process.argv[urlIndex + 1];
}

// Run the tests
runCorsTests().catch(error => {
    log(`\n❌ Test execution failed: ${error.message}`, 'red');
    process.exit(1);
});
