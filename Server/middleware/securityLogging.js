const { secureLogger, SECURITY_EVENTS, SECURITY_LEVELS } = require('../utils/logger');

// Security logging middleware
const securityLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  
  // Override res.send to capture response details
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Log access event
    secureLogger.logAccess(
      req.method,
      req.originalUrl,
      res.statusCode,
      responseTime,
      req.ip,
      req.get('User-Agent'),
      req.user ? req.user.id : null
    );

    // Log security events based on status code
    if (res.statusCode >= 400) {
      if (res.statusCode === 401) {
        secureLogger.logSecurityViolation(
          'unauthorized_access',
          {
            url: req.originalUrl,
            method: req.method,
            userAgent: req.get('User-Agent')
          },
          req.ip,
          req.get('User-Agent')
        );
      } else if (res.statusCode === 403) {
        secureLogger.logSecurityViolation(
          'forbidden_access',
          {
            url: req.originalUrl,
            method: req.method,
            userId: req.user ? req.user.id : null
          },
          req.ip,
          req.get('User-Agent')
        );
      } else if (res.statusCode >= 500) {
        secureLogger.logSystemError(
          new Error(`Server error: ${res.statusCode}`),
          {
            url: req.originalUrl,
            method: req.method,
            body: req.body
          },
          req.user ? req.user.id : null,
          req.ip
        );
      }
    }

    // Call original send
    originalSend.call(this, data);
  };

  next();
};

// Authentication logging middleware
const authLoggingMiddleware = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Log authentication events
    if (req.path === '/login' || req.path === '/adminlogin') {
      const isSuccess = data.success === true;
      const email = req.body ? req.body.email : null;
      
      secureLogger.logAuthentication(
        data.user ? data.user.id : null,
        email,
        'login',
        isSuccess,
        req.ip,
        req.get('User-Agent')
      );
    } else if (req.path === '/logout') {
      secureLogger.logAuthentication(
        req.user ? req.user.id : null,
        req.user ? req.user.email : null,
        'logout',
        true,
        req.ip,
        req.get('User-Agent')
      );
    } else if (req.path === '/signup') {
      const isSuccess = data.success === true;
      const email = req.body ? req.body.email : null;
      
      secureLogger.logAuthentication(
        data.user ? data.user.id : null,
        email,
        'signup',
        isSuccess,
        req.ip,
        req.get('User-Agent')
      );
    }

    // Call original json
    originalJson.call(this, data);
  };

  next();
};

// Data access logging middleware
const dataAccessLoggingMiddleware = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Log data access events
    if (req.method === 'GET' && req.user) {
      secureLogger.logDataAccess(
        req.user.id,
        req.originalUrl,
        'read',
        data,
        req.ip
      );
    }

    // Call original json
    originalJson.call(this, data);
  };

  next();
};

// Data modification logging middleware
const dataModificationLoggingMiddleware = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Log data modification events
    if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') && req.user) {
      const action = req.method === 'POST' ? 'create' : 
                   req.method === 'PUT' ? 'update' : 'delete';
      
      secureLogger.logDataModification(
        req.user.id,
        req.originalUrl,
        action,
        req.body,
        req.ip
      );
    }

    // Call original json
    originalJson.call(this, data);
  };

  next();
};

// File operation logging middleware
const fileOperationLoggingMiddleware = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Log file operations
    if (req.path === '/upload' && req.user) {
      const isSuccess = data.success === true;
      const filename = req.file ? req.file.originalname : null;
      
      secureLogger.logFileOperation(
        req.user.id,
        'upload',
        filename,
        isSuccess,
        req.ip
      );
    } else if (req.path.startsWith('/uploaded-files/') && req.method === 'DELETE' && req.user) {
      const filename = req.params.filename;
      
      secureLogger.logFileOperation(
        req.user.id,
        'delete',
        filename,
        data.success === true,
        req.ip
      );
    }

    // Call original json
    originalJson.call(this, data);
  };

  next();
};

// Admin action logging middleware
const adminActionLoggingMiddleware = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Log admin actions
    if (req.user && req.user.role === 'admin') {
      const adminActions = [
        '/addproduct', '/removeproduct', '/updateproduct',
        '/updateBookingStatus2', '/updateBookingDetails', '/deleteBookingRequest',
        '/addservice', '/deleteServices', '/updateservice',
        '/customers', '/users'
      ];
      
      if (adminActions.some(action => req.path.includes(action))) {
        secureLogger.logAdminAction(
          req.user.id,
          req.method + ' ' + req.path,
          req.params.id || 'new',
          req.body,
          req.ip
        );
      }
    }

    // Call original json
    originalJson.call(this, data);
  };

  next();
};

// Rate limiting violation logging
const rateLimitLoggingMiddleware = (req, res, next) => {
  // This middleware should be used with express-rate-limit
  const originalJson = res.json;
  
  res.json = function(data) {
    if (res.statusCode === 429) {
      secureLogger.logSecurityViolation(
        'rate_limit_exceeded',
        {
          url: req.originalUrl,
          method: req.method,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        },
        req.ip,
        req.get('User-Agent')
      );
    }

    // Call original json
    originalJson.call(this, data);
  };

  next();
};

// Suspicious activity detection middleware
const suspiciousActivityMiddleware = (req, res, next) => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /eval\(/i,
    /document\./i,
    /window\./i,
    /alert\(/i,
    /confirm\(/i,
    /prompt\(/i,
    /union.*select/i,
    /drop.*table/i,
    /insert.*into/i,
    /delete.*from/i,
    /update.*set/i
  ];

  // Check request body
  if (req.body) {
    const bodyString = JSON.stringify(req.body);
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(bodyString)) {
        secureLogger.logSecurityViolation(
          'suspicious_input_detected',
          {
            pattern: pattern.toString(),
            url: req.originalUrl,
            method: req.method,
            body: req.body
          },
          req.ip,
          req.get('User-Agent')
        );
        break;
      }
    }
  }

  // Check query parameters
  if (req.query) {
    const queryString = JSON.stringify(req.query);
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(queryString)) {
        secureLogger.logSecurityViolation(
          'suspicious_query_detected',
          {
            pattern: pattern.toString(),
            url: req.originalUrl,
            method: req.method,
            query: req.query
          },
          req.ip,
          req.get('User-Agent')
        );
        break;
      }
    }
  }

  next();
};

// Error logging middleware
const errorLoggingMiddleware = (err, req, res, next) => {
  secureLogger.logSystemError(
    err,
    {
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params
    },
    req.user ? req.user.id : null,
    req.ip
  );

  next(err);
};

module.exports = {
  securityLoggingMiddleware,
  authLoggingMiddleware,
  dataAccessLoggingMiddleware,
  dataModificationLoggingMiddleware,
  fileOperationLoggingMiddleware,
  adminActionLoggingMiddleware,
  rateLimitLoggingMiddleware,
  suspiciousActivityMiddleware,
  errorLoggingMiddleware
};
