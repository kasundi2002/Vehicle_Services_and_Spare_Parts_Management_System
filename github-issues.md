# GitHub Issues for Security Vulnerabilities

## Issue 1: Hardcoded JWT Secret Key (Critical)

**Title:** 🔒 CRITICAL: Hardcoded JWT Secret Key Exposes Authentication System

**Labels:** `security`, `critical`, `authentication`, `needs-immediate-fix`

**Description:**
The JWT secret key is hardcoded in the source code, allowing attackers to forge authentication tokens and gain unauthorized access to the system.

**Location:** `Server/index.js:293,349,374`

**Evidence:**
```javascript
const token = jwt.sign(data, 'secret_ecom');
```

**Risk:** Complete authentication bypass - attackers can generate valid JWT tokens for any user.

**Reproduction Steps:**
1. Examine `Server/index.js` lines 293, 349, and 374
2. Observe hardcoded secret `'secret_ecom'`
3. Use this secret to forge JWT tokens

**Suggested Fix:**
```javascript
const token = jwt.sign(data, process.env.JWT_SECRET || 'fallback-secret-change-in-production');
```

**Priority:** Critical - Fix immediately

---

## Issue 2: Plaintext Password Storage (Critical)

**Title:** 🔒 CRITICAL: Passwords Stored in Plaintext

**Labels:** `security`, `critical`, `authentication`, `data-protection`

**Description:**
User passwords are stored in plaintext in the database without any hashing or encryption.

**Location:** `Server/index.js:281,342,364`

**Evidence:**
```javascript
password:req.body.password,
const passCompare = req.body.password === user.password;
```

**Risk:** Anyone with database access can read user passwords, leading to account takeover.

**Reproduction Steps:**
1. Register a new user with password "test123"
2. Check database - password is stored as "test123"
3. Login comparison uses direct string comparison

**Suggested Fix:**
Implement bcrypt hashing:
```javascript
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(password, user.password);
```

**Priority:** Critical - Fix immediately

---

## Issue 3: MongoDB Connection String Exposed (Critical)

**Title:** 🔒 CRITICAL: Database Credentials Exposed in Source Code

**Labels:** `security`, `critical`, `database`, `credentials`

**Description:**
MongoDB connection string with credentials is hardcoded in the source code.

**Location:** `Server/index.js:20`

**Evidence:**
```javascript
mongoose.connect("mongodb+srv://vehicleitp:16873Myno@test.fw5mj0t.mongodb.net/itpdb");
```

**Risk:** Unauthorized database access and data breach.

**Reproduction Steps:**
1. Open `Server/index.js` line 20
2. Observe hardcoded MongoDB credentials
3. Use credentials to access database directly

**Suggested Fix:**
```javascript
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle-services');
```

**Priority:** Critical - Fix immediately

---

## Issue 4: Mongoose Search Injection Vulnerability (High)

**Title:** 🚨 HIGH: Mongoose Search Injection Vulnerability

**Labels:** `security`, `high`, `injection`, `database`

**Description:**
Mongoose version 8.3.0 has a critical search injection vulnerability that allows NoSQL injection attacks.

**Location:** Server dependencies

**Evidence:**
- Mongoose version: 8.3.0
- CVE-2024-xxxxx: Search injection vulnerability
- CVSS Score: 9.1

**Risk:** Attackers can perform NoSQL injection to bypass authentication or access unauthorized data.

**Reproduction Steps:**
1. Check `Server/package.json` - mongoose version 8.3.0
2. Run `npm audit` to see vulnerability details
3. Exploit using malicious search parameters

**Suggested Fix:**
```bash
npm update mongoose@8.9.5
```

**Priority:** High - Fix within 24 hours

---

## Issue 5: Unrestricted CORS Policy (High)

**Title:** 🚨 HIGH: Unrestricted CORS Allows Cross-Origin Attacks

**Labels:** `security`, `high`, `cors`, `misconfiguration`

**Description:**
CORS is configured to allow requests from any origin, enabling CSRF attacks and unauthorized API access.

**Location:** `Server/index.js:17`

**Evidence:**
```javascript
app.use(cors());
```

**Risk:** Any website can make requests to the API, enabling CSRF attacks and unauthorized access.

**Reproduction Steps:**
1. Create a malicious website
2. Make AJAX requests to the API from the malicious site
3. Observe successful cross-origin requests

**Suggested Fix:**
```javascript
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
```

**Priority:** High - Fix within 48 hours

---

## Issue 6: Missing Security Headers (High)

**Title:** 🚨 HIGH: Missing Security Headers

**Labels:** `security`, `high`, `headers`, `misconfiguration`

**Description:**
The application lacks essential security headers, making it vulnerable to various attacks.

**Location:** `Server/index.js`

**Evidence:**
- No helmet middleware
- No security headers implemented
- Missing CSP, HSTS, X-Frame-Options, etc.

**Risk:** Vulnerable to clickjacking, XSS, and other client-side attacks.

**Reproduction Steps:**
1. Start the server
2. Make a request to any endpoint
3. Check response headers - no security headers present

**Suggested Fix:**
```javascript
const helmet = require('helmet');
app.use(helmet());
```

**Priority:** High - Fix within 48 hours

---

## Issue 7: Insecure File Upload (High)

**Title:** 🚨 HIGH: File Upload Lacks Security Validation

**Labels:** `security`, `high`, `file-upload`, `validation`

**Description:**
File upload functionality has no validation for file types, sizes, or malicious content.

**Location:** `Server/index.js:30-47`

**Evidence:**
```javascript
const upload = multer({storage:storage})
// No file type validation
```

**Risk:** Malicious files can be uploaded, potentially leading to remote code execution.

**Reproduction Steps:**
1. Create a malicious file (e.g., shell.php)
2. Upload via `/upload` endpoint
3. File is accepted without validation

**Suggested Fix:**
```javascript
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};
```

**Priority:** High - Fix within 48 hours

---

## Issue 8: Vulnerable Dependencies (High)

**Title:** 🚨 HIGH: Multiple Vulnerable Dependencies

**Labels:** `security`, `high`, `dependencies`, `updates`

**Description:**
17 vulnerable dependencies found with known security issues.

**Location:** Server dependencies

**Evidence:**
- 17 vulnerabilities found via `npm audit`
- Critical: mongoose search injection
- High: express, axios, dompurify, etc.

**Risk:** Known vulnerabilities can be exploited by attackers.

**Reproduction Steps:**
1. Run `npm audit` in Server directory
2. Observe 17 vulnerabilities listed
3. Check specific CVE details

**Suggested Fix:**
```bash
npm audit fix --force
npm update
```

**Priority:** High - Fix within 48 hours

---

## Issue 9: No Input Validation (High)

**Title:** 🚨 HIGH: Missing Input Validation on API Endpoints

**Labels:** `security`, `high`, `validation`, `injection`

**Description:**
API endpoints accept user input without validation, enabling injection attacks.

**Location:** Multiple endpoints in `Server/index.js`

**Evidence:**
- Direct use of `req.body` without validation
- No sanitization of user input
- Vulnerable to injection attacks

**Risk:** SQL injection, NoSQL injection, and application crashes.

**Reproduction Steps:**
1. Send malicious payload to any API endpoint
2. Observe lack of validation
3. Test with injection payloads

**Suggested Fix:**
```javascript
const expressValidator = require('express-validator');
// Add validation middleware to all endpoints
```

**Priority:** High - Fix within 48 hours

---

## Issue 10: Missing Rate Limiting (High)

**Title:** 🚨 HIGH: No Rate Limiting on API Endpoints

**Labels:** `security`, `high`, `rate-limiting`, `dos`

**Description:**
API endpoints lack rate limiting, making them vulnerable to DoS attacks and brute force attempts.

**Location:** `Server/index.js`

**Evidence:**
- No rate limiting middleware
- All endpoints accessible without limits
- Vulnerable to brute force and DoS

**Risk:** DoS attacks and brute force password attempts.

**Reproduction Steps:**
1. Make rapid requests to any endpoint
2. Observe no rate limiting
3. Attempt brute force on login endpoint

**Suggested Fix:**
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);
```

**Priority:** High - Fix within 48 hours

---

## Issue 11: Email Credentials Exposed (Medium)

**Title:** ⚠️ MEDIUM: Email Service Credentials Hardcoded

**Labels:** `security`, `medium`, `credentials`, `email`

**Description:**
Gmail credentials for email service are hardcoded in the source code.

**Location:** `Server/index.js:564-567`

**Evidence:**
```javascript
auth: {
    user: 'pprajeshvara@gmail.com',
    pass: 'wjjm bzhn lxkp ennh'
}
```

**Risk:** Email service account compromise and unauthorized email sending.

**Reproduction Steps:**
1. Check `Server/index.js` lines 564-567
2. Observe hardcoded Gmail credentials
3. Use credentials to access Gmail account

**Suggested Fix:**
```javascript
auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
}
```

**Priority:** Medium - Fix within 1 week

---

## Issue 12: Missing CSRF Protection (Medium)

**Title:** ⚠️ MEDIUM: No CSRF Protection on State-Changing Operations

**Labels:** `security`, `medium`, `csrf`, `protection`

**Description:**
API endpoints that modify data lack CSRF protection.

**Location:** `Server/index.js`

**Evidence:**
- No CSRF tokens on POST/PUT/DELETE requests
- State-changing operations vulnerable to CSRF

**Risk:** Cross-site request forgery attacks can perform unauthorized actions.

**Reproduction Steps:**
1. Create a malicious website
2. Include form that submits to API
3. Submit form - request succeeds without CSRF token

**Suggested Fix:**
```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);
```

**Priority:** Medium - Fix within 1 week

---

## Issue 13: Information Disclosure (Medium)

**Title:** ⚠️ MEDIUM: Detailed Error Messages Expose Sensitive Information

**Labels:** `security`, `medium`, `information-disclosure`, `errors`

**Description:**
Error responses include detailed stack traces and sensitive information.

**Location:** `Server/index.js`

**Evidence:**
- Detailed error messages in responses
- Stack traces exposed to clients
- Sensitive information in error logs

**Risk:** Sensitive information leaked through error responses.

**Reproduction Steps:**
1. Trigger an error (e.g., invalid input)
2. Check error response
3. Observe detailed error information

**Suggested Fix:**
```javascript
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});
```

**Priority:** Medium - Fix within 1 week

---

## Issue 14: Missing HTTPS Enforcement (Medium)

**Title:** ⚠️ MEDIUM: No HTTPS Redirection or Enforcement

**Labels:** `security`, `medium`, `https`, `encryption`

**Description:**
Application doesn't enforce HTTPS connections.

**Location:** `Server/index.js`

**Evidence:**
- No HTTPS redirection middleware
- No HTTPS enforcement headers
- Data transmitted over unencrypted connections

**Risk:** Data interception over unencrypted connections.

**Reproduction Steps:**
1. Access application over HTTP
2. Check for HTTPS redirection
3. Observe no HTTPS enforcement

**Suggested Fix:**
```javascript
app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
        next();
    }
});
```

**Priority:** Medium - Fix within 1 week

---

## Summary of Issues Created:
- **Critical Issues:** 3 (Issues #1-3)
- **High Priority Issues:** 7 (Issues #4-10)  
- **Medium Priority Issues:** 4 (Issues #11-14)

**Total:** 14 security issues requiring immediate attention

Each issue includes:
- Clear title with severity indicator
- Appropriate labels for categorization
- Detailed description and evidence
- Reproduction steps
- Suggested fix with code examples
- Priority level for remediation

**Recommended Actions:**
1. Fix all Critical issues immediately
2. Address High priority issues within 48 hours
3. Resolve Medium priority issues within 1 week
4. Implement security testing in CI/CD pipeline
5. Conduct regular security audits





