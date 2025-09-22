# Security Setup Guide
## Vehicle Services and Spare Parts Management System

This guide will help you implement the security fixes and OAuth integration for your assignment.

---

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Google Cloud Console account (for OAuth)

---

## Step 1: Install Security Dependencies

```bash
cd Server
npm install bcryptjs express-rate-limit helmet passport passport-google-oauth20 passport-jwt
```

---

## Step 2: Environment Configuration

1. Create a `.env` file in the Server directory:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/vehicle_services
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# JWT Configuration (Generate a strong secret)
JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_characters

# Email Configuration
EMAIL_ADD=your_email@gmail.com
EMAIL_PW=your_app_password

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

2. **Generate a strong JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Step 3: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen
6. Set authorized redirect URIs: `http://localhost:5000/auth/google/callback`
7. Copy Client ID and Client Secret to your `.env` file

---

## Step 4: Database Migration (Password Hashing)

Create a migration script to hash existing passwords:

```javascript
// migration.js
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

const Users = require('./models/OnlineShopModels/Users');
const Admins = require('./models/OnlineShopModels/Admin');

async function migratePasswords() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Hash user passwords
    const users = await Users.find({});
    for (let user of users) {
      if (user.password && !user.password.startsWith('$2')) {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        await Users.findByIdAndUpdate(user._id, { password: hashedPassword });
        console.log(`Updated user: ${user.email}`);
      }
    }

    // Hash admin passwords
    const admins = await Admins.find({});
    for (let admin of admins) {
      if (admin.password && !admin.password.startsWith('$2')) {
        const hashedPassword = await bcrypt.hash(admin.password, 12);
        await Admins.findByIdAndUpdate(admin._id, { password: hashedPassword });
        console.log(`Updated admin: ${admin.email}`);
      }
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migratePasswords();
```

Run the migration:
```bash
node migration.js
```

---

## Step 5: Update Frontend Authentication

1. Replace the existing authentication components with the secure versions
2. Update API calls to use the new secure endpoints
3. Implement proper error handling for security responses

---

## Step 6: Testing Security Implementation

### Test Password Hashing
```bash
# Test login with old password (should fail)
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"oldpassword"}'

# Test login with new hashed password (should work)
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"newpassword"}'
```

### Test Rate Limiting
```bash
# Make multiple requests quickly (should be rate limited)
for i in {1..10}; do
  curl -X POST http://localhost:5000/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}'
done
```

### Test OAuth Flow
1. Start the server: `npm start`
2. Visit: `http://localhost:5000/auth/google`
3. Complete Google OAuth flow
4. Verify redirect with token

---

## Step 7: Security Validation Checklist

- [ ] All passwords are hashed with bcrypt
- [ ] JWT secrets are properly configured
- [ ] Rate limiting is working
- [ ] Security headers are present
- [ ] CORS is properly configured
- [ ] Input validation is comprehensive
- [ ] OAuth integration is functional
- [ ] File uploads are secure
- [ ] Environment variables are protected

---

## Step 8: Production Deployment Security

### Environment Variables
- Use a secure secret management service
- Never commit `.env` files to version control
- Use different secrets for different environments

### Database Security
- Enable MongoDB authentication
- Use TLS/SSL for database connections
- Implement database access controls

### Server Security
- Use HTTPS in production
- Implement proper firewall rules
- Regular security updates
- Monitor for security events

---

## Troubleshooting

### Common Issues:

1. **JWT Secret Error**
   - Ensure JWT_SECRET is set in environment variables
   - Use a strong secret (minimum 32 characters)

2. **OAuth Redirect Error**
   - Check Google Cloud Console configuration
   - Verify callback URL matches exactly

3. **Rate Limiting Too Strict**
   - Adjust limits in the rate limiter configuration
   - Consider different limits for different endpoints

4. **CORS Errors**
   - Verify ALLOWED_ORIGINS includes your frontend URL
   - Check for typos in origin URLs

---

## Security Monitoring

### Log Security Events
```javascript
// Add to your server
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'security.log' })
  ]
});

// Log failed login attempts
logger.warn('Failed login attempt', { 
  email: req.body.email, 
  ip: req.ip, 
  timestamp: new Date() 
});
```

### Monitor for Attacks
- Failed login attempts
- Rate limit violations
- Unusual API usage patterns
- File upload attempts with malicious content

---

## Additional Security Recommendations

1. **Regular Security Audits**
   - Run `npm audit` weekly
   - Use automated security scanning tools
   - Conduct penetration testing

2. **User Education**
   - Implement security awareness training
   - Provide clear password guidelines
   - Educate about phishing attacks

3. **Backup and Recovery**
   - Regular database backups
   - Test recovery procedures
   - Document incident response plans

---

## Support

For questions about this security implementation:
- Review the security report (SECURITY_REPORT.md)
- Check the OWASP guidelines
- Consult the Express.js security documentation

---

**Remember:** Security is an ongoing process, not a one-time implementation. Regular updates and monitoring are essential for maintaining a secure application.
