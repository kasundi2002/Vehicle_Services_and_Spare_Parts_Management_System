const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Create a test app with CORS configuration
const createTestApp = () => {
    const app = express();
    
    // CORS Configuration (same as in index.js)
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173', 'https://trusted-domain.com'];
    
    const corsOptions = {
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'auth-token', 'X-Requested-With'],
        optionsSuccessStatus: 200
    };
    
    app.use(cors(corsOptions));
    
    // Test endpoints
    app.get('/test-public', (req, res) => {
        res.json({ message: 'Public endpoint' });
    });
    
    app.post('/test-authenticated', (req, res) => {
        res.json({ message: 'Authenticated endpoint' });
    });
    
    return app;
};

describe('CORS Configuration Tests', () => {
    let app;
    
    beforeEach(() => {
        app = createTestApp();
    });
    
    describe('Allowed Origins', () => {
        test('should allow requests from localhost:3000', async () => {
            const response = await request(app)
                .get('/test-public')
                .set('Origin', 'http://localhost:3000')
                .expect(200);
            
            expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
            expect(response.headers['access-control-allow-credentials']).toBe('true');
        });
        
        test('should allow requests from localhost:5173', async () => {
            const response = await request(app)
                .get('/test-public')
                .set('Origin', 'http://localhost:5173')
                .expect(200);
            
            expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
            expect(response.headers['access-control-allow-credentials']).toBe('true');
        });
        
        test('should allow requests from trusted domain', async () => {
            const response = await request(app)
                .get('/test-public')
                .set('Origin', 'https://trusted-domain.com')
                .expect(200);
            
            expect(response.headers['access-control-allow-origin']).toBe('https://trusted-domain.com');
            expect(response.headers['access-control-allow-credentials']).toBe('true');
        });
    });
    
    describe('Blocked Origins', () => {
        test('should block requests from untrusted origins', async () => {
            const response = await request(app)
                .get('/test-public')
                .set('Origin', 'https://malicious-site.com')
                .expect(500);
            
            expect(response.headers['access-control-allow-origin']).toBeUndefined();
        });
        
        test('should block requests from suspicious origins', async () => {
            const response = await request(app)
                .get('/test-public')
                .set('Origin', 'http://evil.com')
                .expect(500);
            
            expect(response.headers['access-control-allow-origin']).toBeUndefined();
        });
    });
    
    describe('Preflight Requests', () => {
        test('should handle OPTIONS preflight requests correctly', async () => {
            const response = await request(app)
                .options('/test-authenticated')
                .set('Origin', 'http://localhost:3000')
                .set('Access-Control-Request-Method', 'POST')
                .set('Access-Control-Request-Headers', 'Content-Type, auth-token')
                .expect(200);
            
            expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
            expect(response.headers['access-control-allow-methods']).toContain('POST');
            expect(response.headers['access-control-allow-headers']).toContain('auth-token');
        });
        
        test('should reject preflight requests from untrusted origins', async () => {
            const response = await request(app)
                .options('/test-authenticated')
                .set('Origin', 'https://malicious-site.com')
                .set('Access-Control-Request-Method', 'POST')
                .expect(500);
            
            expect(response.headers['access-control-allow-origin']).toBeUndefined();
        });
    });
    
    describe('No Origin Requests', () => {
        test('should allow requests with no origin header', async () => {
            const response = await request(app)
                .get('/test-public')
                .expect(200);
            
            // Should not have CORS headers for no-origin requests
            expect(response.headers['access-control-allow-origin']).toBeUndefined();
        });
    });
    
    describe('CORS Headers Validation', () => {
        test('should include correct CORS headers for allowed origins', async () => {
            const response = await request(app)
                .get('/test-public')
                .set('Origin', 'http://localhost:3000')
                .expect(200);
            
            expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
            expect(response.headers['access-control-allow-credentials']).toBe('true');
            expect(response.headers['access-control-allow-methods']).toContain('GET');
            expect(response.headers['access-control-allow-methods']).toContain('POST');
            expect(response.headers['access-control-allow-methods']).toContain('PUT');
            expect(response.headers['access-control-allow-methods']).toContain('DELETE');
            expect(response.headers['access-control-allow-methods']).toContain('OPTIONS');
        });
    });
});
