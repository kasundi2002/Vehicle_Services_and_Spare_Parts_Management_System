# Security Audit Report - Vehicle Services and Spare Parts Management System

## Executive Summary

This security audit identified **15 critical security vulnerabilities** across the Vehicle Services and Spare Parts Management System, including 3 critical, 8 high, and 4 medium severity issues. The application has significant security weaknesses in authentication, data protection, and input validation that require immediate attention.

## Vulnerability Table

| # | Vulnerability Title | OWASP Category | Location | Severity | Evidence | Fix Summary |
|---|---|---|---|---|---|---|
| 1 | Hardcoded JWT Secret Key | A07:2021 – Identification and Authentication Failures | Server/index.js:293,349,374 | **Critical** | `jwt.sign(data, 'secret_ecom')` | Use environment variables for secrets |
| 2 | Plaintext Password Storage | A07:2021 – Identification and Authentication Failures | Server/index.js:281,342,364 | **Critical** | `password:req.body.password` and `req.body.password === user.password` | Implement bcrypt hashing |
| 3 | MongoDB Connection String Exposed | A07:2021 – Identification and Authentication Failures | Server/index.js:20 | **Critical** | `mongoose.connect("mongodb+srv://vehicleitp:16873Myno@test.fw5mj0t.mongodb.net/itpdb")` | Use environment variables |
| 4 | Mongoose Search Injection | A02:2021 – Cryptographic Failures | Server (mongoose 8.3.0) | **High** | CVE-2024-xxxxx in mongoose | Update mongoose to 8.9.5+ |
| 5 | Unrestricted CORS Policy | A05:2021 – Security Misconfiguration | Server/index.js:17 | **High** | `app.use(cors())` allows all origins | Restrict CORS to specific domains |
| 6 | Missing Security Headers | A05:2021 – Security Misconfiguration | Server/index.js | **High** | No helmet or security headers | Implement helmet middleware |
| 7 | Insecure File Upload | A01:2021 – Broken Access Control | Server/index.js:30-47 | **High** | No file type validation | Add MIME type and extension validation |
| 8 | Vulnerable Dependencies | A06:2021 – Vulnerable and Outdated Components | Multiple packages | **High** | 17 vulnerable dependencies found | Update all dependencies |
| 9 | No Input Validation | A03:2021 – Injection | Server/index.js (multiple endpoints) | **High** | Direct use of req.body without validation | Implement input validation middleware |
| 10 | Missing Rate Limiting | A04:2021 – Insecure Design | Server/index.js | **High** | No rate limiting on any endpoints | Implement rate limiting |
| 11 | Email Credentials Exposed | A07:2021 – Identification and Authentication Failures | Server/index.js:564-567 | **Medium** | Hardcoded Gmail credentials | Use environment variables |
| 12 | Missing CSRF Protection | A01:2021 – Broken Access Control | Server/index.js | **Medium** | No CSRF tokens on state-changing operations | Implement CSRF protection |
| 13 | Information Disclosure | A09:2021 – Security Logging and Monitoring Failures | Server/index.js | **Medium** | Detailed error messages exposed | Implement proper error handling |
| 14 | Missing HTTPS Enforcement | A02:2021 – Cryptographic Failures | Server/index.js | **Medium** | No HTTPS redirection or enforcement | Implement HTTPS enforcement |

## Detailed Vulnerability Analysis

### 1. Hardcoded JWT Secret Key (Critical)

**Location:** `Server/index.js:293,349,374`
**OWASP:** A07:2021 – Identification and Authentication Failures

**Evidence:**
```javascript
const token = jwt.sign(data, 'secret_ecom');
```

**Risk:** JWT tokens can be forged by attackers who know the secret, allowing complete authentication bypass.

**Fix:**
```javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign(data, process.env.JWT_SECRET || 'fallback-secret-change-in-production');
```

### 2. Plaintext Password Storage (Critical)

**Location:** `Server/index.js:281,342,364`
**OWASP:** A07:2021 – Identification and Authentication Failures

**Evidence:**
```javascript
password:req.body.password,
const passCompare = req.body.password === user.password;
```

**Risk:** Passwords stored in plaintext can be read by anyone with database access.

**Fix:**
```javascript
const bcrypt = require('bcrypt');

// On registration
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

// On login
const isValidPassword = await bcrypt.compare(req.body.password, user.password);
```

### 3. MongoDB Connection String Exposed (Critical)

**Location:** `Server/index.js:20`
**OWASP:** A07:2021 – Identification and Authentication Failures

**Evidence:**
```javascript
mongoose.connect("mongodb+srv://vehicleitp:16873Myno@test.fw5mj0t.mongodb.net/itpdb");
```

**Risk:** Database credentials are exposed in source code, allowing unauthorized database access.

**Fix:**
```javascript
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle-services');
```

### 4. Mongoose Search Injection (High)

**Location:** Server dependencies
**OWASP:** A02:2021 – Cryptographic Failures

**Evidence:** Mongoose version 8.3.0 has known search injection vulnerabilities (CVE-2024-xxxxx)

**Risk:** Attackers can perform NoSQL injection attacks through search parameters.

**Fix:** Update mongoose to version 8.9.5 or higher:
```bash
npm update mongoose
```

### 5. Cross-Domain (CORS) Misconfiguration (High) - FIXED ✅

**Location:** `Server/index.js:17`
**OWASP:** A05:2021 – Security Misconfiguration
**Severity:** High
**Status:** RESOLVED

**Before (Vulnerable):**
```javascript
app.use(cors()); // Allows ALL origins
```

**Evidence:**
- ZAP Alert ID: 10021 - Cross-Domain Misconfiguration
- curl -I -H "Origin: https://malicious-site.com" http://localhost:4000/allproducts
- Response: `Access-Control-Allow-Origin: *`
- Any website could make requests to the API

**Risk:** 
- CSRF attacks enabled
- Unauthorized API access
- Data exfiltration possible
- Session hijacking risk

**After (Fixed):**
```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3000', 'http://localhost:5173'];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'auth-token', 'X-Requested-With'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

**Remediation Summary:**
- Implemented origin allowlist validation
- Environment-driven configuration
- Proper credentials handling
- Restricted methods and headers
- Added security logging
- Created comprehensive test suite

**Test Commands:**
```bash
# Test allowed origin
curl -I -H "Origin: http://localhost:3000" http://localhost:4000/allproducts

# Test blocked origin  
curl -I -H "Origin: https://malicious-site.com" http://localhost:4000/allproducts

# Run test suite
npm run test:cors
```

**Verification:**
- ✅ Allowed origins return proper CORS headers
- ✅ Blocked origins return CORS errors
- ✅ Integration tests pass
- ✅ ZAP scan shows no CORS misconfiguration alerts

### 6. Missing Security Headers (High)

**Location:** `Server/index.js`
**OWASP:** A05:2021 – Security Misconfiguration

**Evidence:** No security headers implemented

**Risk:** Missing security headers leave the application vulnerable to various attacks.

**Fix:**
```javascript
const helmet = require('helmet');
app.use(helmet());
app.use(helmet.hsts({ maxAge: 31536000 }));
```

### 7. Insecure File Upload (High)

**Location:** `Server/index.js:30-47`
**OWASP:** A01:2021 – Broken Access Control

**Evidence:**
```javascript
const upload = multer({storage:storage})
app.post("/upload",upload.single('product'),(req,res)=>{
```

**Risk:** No file type validation allows malicious file uploads.

**Fix:**
```javascript
const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
```

### 8. Vulnerable Dependencies (High)

**Location:** Multiple packages
**OWASP:** A06:2021 – Vulnerable and Outdated Components

**Evidence:** npm audit found 17 vulnerabilities including:
- mongoose: critical search injection vulnerability
- axios: high severity SSRF vulnerability  
- dompurify: high severity XSS bypass
- form-data: critical random function vulnerability

**Risk:** Known vulnerabilities in dependencies can be exploited.

**Fix:**
```bash
npm audit fix --force
npm update
```

### 9. No Input Validation (High)

**Location:** Multiple endpoints in `Server/index.js`
**OWASP:** A03:2021 – Injection

**Evidence:** Direct use of `req.body` without validation

**Risk:** Malicious input can cause injection attacks or application crashes.

**Fix:**
```javascript
const expressValidator = require('express-validator');

app.post('/signup', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // ... rest of handler
});
```

### 10. Missing Rate Limiting (High)

**Location:** `Server/index.js`
**OWASP:** A04:2021 – Insecure Design

**Evidence:** No rate limiting implemented

**Risk:** API endpoints can be abused for DoS attacks or brute force attempts.

**Fix:**
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many login attempts, please try again later.'
});

app.use('/login', loginLimiter);
```

### 11. Email Credentials Exposed (Medium)

**Location:** `Server/index.js:564-567`
**OWASP:** A07:2021 – Identification and Authentication Failures

**Evidence:**
```javascript
auth: {
    user: 'pprajeshvara@gmail.com',
    pass: 'wjjm bzhn lxkp ennh'
}
```

**Risk:** Email service credentials are exposed in source code.

**Fix:**
```javascript
auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
}
```

### 12. Missing CSRF Protection (Medium)

**Location:** `Server/index.js`
**OWASP:** A01:2021 – Broken Access Control

**Evidence:** No CSRF protection on state-changing operations

**Risk:** Cross-site request forgery attacks can perform unauthorized actions.

**Fix:**
```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);
```

### 13. Information Disclosure (Medium)

**Location:** `Server/index.js`
**OWASP:** A09:2021 – Security Logging and Monitoring Failures

**Evidence:** Detailed error messages and stack traces exposed

**Risk:** Sensitive information leaked through error responses.

**Fix:**
```javascript
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});
```

### 14. Missing HTTPS Enforcement (Medium)

**Location:** `Server/index.js`
**OWASP:** A02:2021 – Cryptographic Failures

**Evidence:** No HTTPS redirection or enforcement

**Risk:** Data transmitted over unencrypted connections can be intercepted.

**Fix:**
```javascript
app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
        next();
    }
});
```

## Dependency Vulnerabilities Summary

### Server Dependencies (17 vulnerabilities found):
- **Critical (1):** mongoose search injection
- **High (7):** express, body-parser, braces, engine.io, path-to-regexp, socket.io, ws
- **Medium (4):** parseuri, socket.io-parser
- **Low (5):** cookie, debug, send, serve-static

### Admin Dependencies (18 vulnerabilities found):
- **Critical (1):** form-data random function
- **High (10):** axios, braces, canvg, cross-spawn, dompurify, engine.io-client, jspdf, jspdf-autotable, rollup, ws
- **Medium (6):** @babel/helpers, @babel/runtime, micromatch, nanoid, vite
- **Low (1):** brace-expansion

## Recommendations

### Immediate Actions Required:
1. **Change all hardcoded secrets** and use environment variables
2. **Implement password hashing** with bcrypt
3. **Update all dependencies** to latest secure versions
4. **Add input validation** to all endpoints
5. **Implement rate limiting** on authentication endpoints

### Security Hardening:
1. **Add security headers** using helmet
2. **Restrict CORS** to specific domains
3. **Implement file upload validation**
4. **Add CSRF protection**
5. **Set up proper error handling**

### Monitoring and Logging:
1. **Implement security logging** for failed authentication attempts
2. **Add monitoring** for suspicious activities
3. **Set up alerts** for security events

## Testing Recommendations

For each vulnerability fix, implement the following tests:

1. **Authentication Tests:** Verify JWT token validation and password hashing
2. **Input Validation Tests:** Test with malicious inputs and SQL injection attempts  
3. **File Upload Tests:** Attempt to upload executable files and oversized files
4. **Rate Limiting Tests:** Verify rate limits are enforced
5. **CORS Tests:** Verify cross-origin requests are properly restricted
6. **Security Header Tests:** Verify all security headers are present

## Conclusion

The Vehicle Services and Spare Parts Management System has significant security vulnerabilities that require immediate attention. The most critical issues involve authentication and data protection. Implementing the recommended fixes will significantly improve the application's security posture.





