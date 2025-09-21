# GitHub Issue: Security - Tighten CORS Allowlist

## Issue Title
🚨 HIGH: Cross-Domain (CORS) Misconfiguration - Unrestricted Origin Access

## Labels
`security`, `high`, `cors`, `misconfiguration`, `owasp-a05`

## Description

### Vulnerability Summary
The application currently uses an unrestricted CORS policy that allows requests from any origin, creating significant security vulnerabilities including CSRF attacks and unauthorized API access.

### Current Behavior
```javascript
app.use(cors()); // Allows ALL origins with Access-Control-Allow-Origin: *
```

### Risk Assessment
- **Severity**: High
- **OWASP Category**: A05:2021 - Security Misconfiguration
- **Impact**: 
  - CSRF attacks enabled
  - Unauthorized API access
  - Data exfiltration possible
  - Session hijacking risk

### Evidence
**ZAP Alert ID**: 10021 - Cross-Domain Misconfiguration

**Proof of Concept**:
```bash
# Malicious origin is allowed
curl -I -H "Origin: https://malicious-site.com" http://localhost:4000/allproducts
# Response: Access-Control-Allow-Origin: *

# Sensitive endpoints accessible from any origin
curl -I -H "Origin: https://attacker.com" http://localhost:4000/login
# Response: Access-Control-Allow-Origin: *
```

### Affected Endpoints
- **Public**: `/allproducts`, `/newcollections`, `/allServices`
- **Authenticated**: `/addtocart`, `/checkout`, `/getcart`
- **Sensitive**: `/login`, `/signup`, `/addproduct`, `/orders`

### Reproduction Steps
1. Start the server: `npm start`
2. Make a request from any origin:
   ```bash
   curl -I -H "Origin: https://evil.com" http://localhost:4000/allproducts
   ```
3. Observe: `Access-Control-Allow-Origin: *` in response headers
4. Any website can now make requests to our API

### Suggested Fix
Implement origin allowlist with environment-driven configuration:

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

### Environment Configuration
```bash
# Development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Production
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
```

### Testing
- [ ] Allowed origins work correctly
- [ ] Blocked origins return CORS errors
- [ ] Integration tests pass
- [ ] ZAP scan shows no CORS alerts
- [ ] Legitimate clients still function

### Priority
**High** - Fix within 48 hours

### Additional Security Recommendations
1. Implement CSRF tokens for state-changing requests
2. Use SameSite cookie attributes
3. Enforce server-side ACL checks regardless of CORS
4. Monitor for blocked CORS attempts

### References
- [OWASP CORS Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Origin_Resource_Sharing_Cheat_Sheet.html)
- [ZAP CORS Alert](https://www.zaproxy.org/docs/alerts/10021/)
