# OAuth2/OpenID Connect Implementation Plan

## Overview

This document outlines the implementation plan for integrating OAuth2/OpenID Connect authentication into the Vehicle Services and Spare Parts Management System. We recommend using **Google OAuth2** as the primary provider due to its reliability, security, and user familiarity.

## Why Google OAuth2?

1. **High Adoption Rate**: Most users already have Google accounts
2. **Robust Security**: Google's OAuth2 implementation is well-tested and secure
3. **Rich Profile Data**: Provides comprehensive user information
4. **Developer-Friendly**: Excellent documentation and SDK support
5. **Free Tier**: No cost for basic OAuth2 functionality

## Implementation Architecture

### Frontend Flow (React/Vite)
```
User clicks "Login with Google" 
    ↓
Redirect to Google OAuth2 consent screen
    ↓
User grants permission
    ↓
Google redirects back with authorization code
    ↓
Frontend sends code to backend
    ↓
Backend exchanges code for tokens
    ↓
Backend creates/updates user session
    ↓
Frontend receives JWT token
```

### Backend Flow (Node.js/Express)
```
Receive authorization code from frontend
    ↓
Exchange code for access token with Google
    ↓
Fetch user profile from Google
    ↓
Create or update user in database
    ↓
Generate internal JWT token
    ↓
Return JWT to frontend
```

## Implementation Steps

### 1. Google Cloud Console Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing one

2. **Enable Google+ API**
   - Navigate to APIs & Services > Library
   - Search for "Google+ API" and enable it

3. **Create OAuth2 Credentials**
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Set application type to "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:4000/auth/google/callback` (development)
     - `https://yourdomain.com/auth/google/callback` (production)

4. **Configure Consent Screen**
   - Go to APIs & Services > OAuth consent screen
   - Choose "External" user type
   - Fill in required information
   - Add scopes: `email`, `profile`, `openid`

### 2. Backend Implementation

#### Install Required Packages
```bash
npm install passport passport-google-oauth20 passport-jwt express-session
```

#### Environment Variables
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
```

#### Passport Configuration
```javascript
// auth/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
            return done(null, user);
        }
        
        // Create new user
        user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            provider: 'google'
        });
        
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// JWT Strategy for API authentication
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
    try {
        const user = await User.findById(payload.id);
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));

module.exports = passport;
```

#### Authentication Routes
```javascript
// routes/auth.js
const express = require('express');
const passport = require('../auth/passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        try {
            // Generate JWT token
            const token = jwt.sign(
                { id: req.user._id, email: req.user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            // Redirect to frontend with token
            res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
        } catch (error) {
            console.error('OAuth callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
        }
    }
);

// Protected route example
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
```

#### Updated User Model
```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    avatar: String,
    provider: {
        type: String,
        enum: ['google', 'local'],
        default: 'local'
    },
    cartData: {
        type: Object,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
```

### 3. Frontend Implementation

#### Install Required Packages
```bash
npm install axios react-google-login
```

#### Google Login Component
```javascript
// components/GoogleLogin.jsx
import React from 'react';
import { GoogleLogin } from 'react-google-login';
import axios from 'axios';

const GoogleLoginButton = ({ onSuccess, onFailure }) => {
    const handleGoogleSuccess = async (response) => {
        try {
            const { tokenId } = response;
            
            // Send token to backend for verification
            const result = await axios.post('/auth/google/verify', {
                token: tokenId
            });
            
            // Store JWT token
            localStorage.setItem('token', result.data.token);
            
            onSuccess(result.data.user);
        } catch (error) {
            console.error('Google login error:', error);
            onFailure(error);
        }
    };

    return (
        <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            buttonText="Login with Google"
            onSuccess={handleGoogleSuccess}
            onFailure={onFailure}
            cookiePolicy={'single_host_origin'}
            isSignedIn={true}
        />
    );
};

export default GoogleLoginButton;
```

#### Authentication Context
```javascript
// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get('/auth/profile');
            setUser(response.data.user);
        } catch (error) {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
```

### 4. Security Considerations

#### 1. State Parameter Validation
```javascript
// Generate and validate state parameter to prevent CSRF
const crypto = require('crypto');

const generateState = () => {
    return crypto.randomBytes(32).toString('hex');
};

const validateState = (state, sessionState) => {
    return state === sessionState;
};
```

#### 2. Token Security
```javascript
// Secure token generation and validation
const generateSecureToken = (user) => {
    return jwt.sign(
        { 
            id: user._id, 
            email: user.email,
            role: user.role 
        },
        process.env.JWT_SECRET,
        { 
            expiresIn: '24h',
            issuer: 'vehicle-services',
            audience: 'vehicle-services-users'
        }
    );
};
```

#### 3. HTTPS Enforcement
```javascript
// Ensure HTTPS in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}
```

#### 4. Session Management
```javascript
// Secure session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
```

### 5. Migration Strategy

#### Phase 1: Parallel Implementation
1. Implement OAuth2 alongside existing authentication
2. Allow users to choose between traditional login and Google OAuth
3. Test thoroughly in development environment

#### Phase 2: Gradual Migration
1. Encourage existing users to link their Google accounts
2. Provide migration tools for existing user data
3. Maintain backward compatibility

#### Phase 3: Full Transition
1. Make OAuth2 the primary authentication method
2. Deprecate traditional username/password login
3. Remove legacy authentication code

### 6. Testing Strategy

#### Unit Tests
```javascript
// tests/auth.test.js
const request = require('supertest');
const app = require('../app');

describe('OAuth2 Authentication', () => {
    test('should redirect to Google OAuth', async () => {
        const response = await request(app)
            .get('/auth/google')
            .expect(302);
        
        expect(response.headers.location).toContain('accounts.google.com');
    });

    test('should handle OAuth callback', async () => {
        // Mock Google OAuth callback
        const response = await request(app)
            .get('/auth/google/callback')
            .query({ code: 'mock-auth-code' })
            .expect(302);
        
        expect(response.headers.location).toContain('token=');
    });
});
```

#### Integration Tests
1. Test complete OAuth2 flow
2. Verify JWT token generation and validation
3. Test user profile creation and updates
4. Verify session management

### 7. Deployment Considerations

#### Environment Variables
```env
# Production environment variables
NODE_ENV=production
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
JWT_SECRET=your-production-jwt-secret
SESSION_SECRET=your-production-session-secret
FRONTEND_URL=https://yourdomain.com
```

#### Docker Configuration
```dockerfile
# Dockerfile for secure deployment
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs

EXPOSE 4000

CMD ["npm", "start"]
```

### 8. Monitoring and Logging

#### Security Logging
```javascript
// Log authentication events
const logAuthEvent = (event, user, req) => {
    console.log({
        timestamp: new Date().toISOString(),
        event: event,
        userId: user?._id,
        email: user?.email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
};

// Usage in auth routes
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        logAuthEvent('oauth_success', req.user, req);
        // ... rest of callback logic
    }
);
```

## Conclusion

This OAuth2/OpenID Connect implementation plan provides a secure, scalable authentication system for the Vehicle Services and Spare Parts Management System. The phased approach ensures minimal disruption while improving security and user experience.

Key benefits of this implementation:
- **Enhanced Security**: Eliminates password-related vulnerabilities
- **Better UX**: One-click login for users
- **Reduced Maintenance**: Less password reset and account recovery overhead
- **Scalability**: Easy to add additional OAuth providers in the future

The implementation should be completed in phases, with thorough testing at each stage to ensure security and functionality.





