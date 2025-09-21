# CORS Security Fix Documentation

## Overview

This document describes the implementation of a secure CORS (Cross-Origin Resource Sharing) configuration to replace the previously unrestricted CORS policy that allowed requests from any origin.

## Problem

The original CORS configuration used `app.use(cors())` without any restrictions, which:
- Allowed requests from any origin (`Access-Control-Allow-Origin: *`)
- Enabled CSRF attacks
- Permitted unauthorized API access
- Created security vulnerabilities

## Solution

Implemented a centralized CORS policy with:
- Environment-driven allowlist of trusted origins
- Origin validation before setting CORS headers
- Proper credentials handling
- Restricted methods and headers
- Secure preflight handling

## Configuration

### Environment Variables

Set the `ALLOWED_ORIGINS` environment variable with comma-separated trusted origins:

```bash
# Development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Production
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
```

### Default Origins

If no environment variable is set, the following origins are allowed by default:
- `http://localhost:3000` (Client React app)
- `http://localhost:5173` (Admin Vite app)

## Implementation Details

### CORS Configuration

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
```

### Security Features

1. **Origin Validation**: Only requests from trusted origins are allowed
2. **Credentials Support**: `Access-Control-Allow-Credentials: true` for trusted origins
3. **Method Restrictions**: Only necessary HTTP methods are allowed
4. **Header Restrictions**: Only required headers are permitted
5. **Logging**: Blocked requests are logged for monitoring

## Migration Steps

### For Development

1. No changes required - default origins are configured
2. Start the server: `npm start`
3. Verify CORS is working with the test suite: `npm run test:cors`

### For Production

1. Set the `ALLOWED_ORIGINS` environment variable:
   ```bash
   export ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
   ```

2. Restart the server

3. Verify the configuration:
   ```bash
   curl -I -H "Origin: https://yourdomain.com" https://your-api.com/allproducts
   ```

### For Staging

1. Set staging-specific origins:
   ```bash
   export ALLOWED_ORIGINS=https://staging.yourdomain.com,https://admin-staging.yourdomain.com
   ```

## Testing

### Automated Tests

Run the CORS test suite:
```bash
npm run test:cors
```

### Manual Testing

Test allowed origins:
```bash
curl -I -H "Origin: http://localhost:3000" http://localhost:4000/allproducts
```

Test blocked origins:
```bash
curl -I -H "Origin: https://malicious-site.com" http://localhost:4000/allproducts
```

### Integration Tests

The test suite covers:
- Allowed origin requests
- Blocked origin requests
- Preflight OPTIONS requests
- No-origin requests
- CORS header validation

## Monitoring

### Logs

Blocked CORS requests are logged with:
```
CORS blocked request from origin: https://malicious-site.com
```

### Metrics

Monitor for:
- High number of CORS blocks (potential attacks)
- Unexpected origins attempting access
- Failed preflight requests

## Security Considerations

### Additional Protections

1. **CSRF Tokens**: Implement CSRF tokens for state-changing requests
2. **SameSite Cookies**: Use SameSite cookie attributes
3. **Server-side ACL**: Enforce access control regardless of CORS
4. **Rate Limiting**: Implement rate limiting for API endpoints

### Public Endpoints

If any endpoints must remain public with `*` origin:
1. Document the business justification
2. Implement additional security measures
3. Monitor for abuse
4. Consider API key authentication

## Troubleshooting

### Common Issues

1. **Legitimate requests blocked**: Add the origin to `ALLOWED_ORIGINS`
2. **CORS errors in browser**: Check origin spelling and protocol (http vs https)
3. **Credentials not working**: Ensure origin is in allowlist and credentials: true

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=cors
```

## References

- [OWASP CORS Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Origin_Resource_Sharing_Cheat_Sheet.html)
- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Middleware](https://github.com/expressjs/cors)
