const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const winston = require('winston');
const { createHash } = require('crypto');

// Security levels for logging
const SECURITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info'
};

// Event types for security logging
const SECURITY_EVENTS = {
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  DATA_ACCESS: 'data_access',
  DATA_MODIFICATION: 'data_modification',
  SECURITY_VIOLATION: 'security_violation',
  SYSTEM_ERROR: 'system_error',
  FILE_OPERATION: 'file_operation',
  NETWORK_ACCESS: 'network_access',
  ADMIN_ACTION: 'admin_action'
};

class SecureLogger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
    this.setupWinstonLogger();
    this.setupLogRotation();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  setupWinstonLogger() {
    // Create different log files for different purposes
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        // Security events log
        new winston.transports.File({
          filename: path.join(this.logDir, 'security.log'),
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        }),
        // Application errors log
        new winston.transports.File({
          filename: path.join(this.logDir, 'error.log'),
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        }),
        // Access log
        new winston.transports.File({
          filename: path.join(this.logDir, 'access.log'),
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        }),
        // Audit log for compliance
        new winston.transports.File({
          filename: path.join(this.logDir, 'audit.log'),
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      ]
    });

    // Add console logging for development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }));
    }
  }

  setupLogRotation() {
    // Set up log rotation to prevent disk space issues
    const logFiles = ['security.log', 'error.log', 'access.log', 'audit.log'];
    
    logFiles.forEach(logFile => {
      const logPath = path.join(this.logDir, logFile);
      if (fs.existsSync(logPath)) {
        const stats = fs.statSync(logPath);
        const fileSizeInMB = stats.size / (1024 * 1024);
        
        // Rotate if file is larger than 10MB
        if (fileSizeInMB > 10) {
          this.rotateLogFile(logPath);
        }
      }
    });
  }

  rotateLogFile(logPath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rotatedPath = `${logPath}.${timestamp}`;
    
    try {
      fs.renameSync(logPath, rotatedPath);
      // Compress old log file
      this.compressLogFile(rotatedPath);
    } catch (error) {
      console.error('Error rotating log file:', error);
    }
  }

  compressLogFile(filePath) {
    // In a production environment, you would use a compression library
    // For now, we'll just move the file to an archive directory
    const archiveDir = path.join(this.logDir, 'archive');
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }
    
    const fileName = path.basename(filePath);
    const archivePath = path.join(archiveDir, fileName);
    
    try {
      fs.renameSync(filePath, archivePath);
    } catch (error) {
      console.error('Error archiving log file:', error);
    }
  }

  // Sanitize sensitive data before logging
  sanitizeData(data) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'auth', 'authorization',
      'creditCard', 'ssn', 'socialSecurityNumber', 'email', 'phone',
      'address', 'personalInfo', 'privateData'
    ];

    const sanitized = { ...data };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Recursively sanitize nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }

  // Generate secure log entry with integrity hash
  generateSecureLogEntry(event, data, level = SECURITY_LEVELS.INFO) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      level,
      data: this.sanitizeData(data),
      source: 'vehicle-services-api',
      version: process.env.API_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    // Generate integrity hash
    const hash = createHash('sha256');
    hash.update(JSON.stringify(logEntry));
    logEntry.integrityHash = hash.digest('hex');

    return logEntry;
  }

  // Log security events
  logSecurityEvent(event, data, level = SECURITY_LEVELS.MEDIUM) {
    const logEntry = this.generateSecureLogEntry(event, data, level);
    
    // Log to security log
    this.logger.info('SECURITY_EVENT', logEntry);
    
    // Log to audit log for compliance
    this.logger.info('AUDIT_EVENT', {
      ...logEntry,
      auditType: 'security_event',
      compliance: true
    });

    // Alert on critical security events
    if (level === SECURITY_LEVELS.CRITICAL) {
      this.sendSecurityAlert(logEntry);
    }
  }

  // Log authentication events
  logAuthentication(userId, email, action, success, ip, userAgent) {
    this.logSecurityEvent(SECURITY_EVENTS.AUTHENTICATION, {
      userId,
      email: success ? email : '[REDACTED]', // Only log email on success
      action, // login, logout, failed_login, etc.
      success,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    }, success ? SECURITY_LEVELS.INFO : SECURITY_LEVELS.HIGH);
  }

  // Log authorization events
  logAuthorization(userId, resource, action, success, ip) {
    this.logSecurityEvent(SECURITY_EVENTS.AUTHORIZATION, {
      userId,
      resource,
      action,
      success,
      ip,
      timestamp: new Date().toISOString()
    }, success ? SECURITY_LEVELS.INFO : SECURITY_LEVELS.HIGH);
  }

  // Log data access events
  logDataAccess(userId, resource, action, data, ip) {
    this.logSecurityEvent(SECURITY_EVENTS.DATA_ACCESS, {
      userId,
      resource,
      action,
      dataCount: Array.isArray(data) ? data.length : 1,
      ip,
      timestamp: new Date().toISOString()
    }, SECURITY_LEVELS.INFO);
  }

  // Log data modification events
  logDataModification(userId, resource, action, changes, ip) {
    this.logSecurityEvent(SECURITY_EVENTS.DATA_MODIFICATION, {
      userId,
      resource,
      action,
      changes: this.sanitizeData(changes),
      ip,
      timestamp: new Date().toISOString()
    }, SECURITY_LEVELS.MEDIUM);
  }

  // Log security violations
  logSecurityViolation(violationType, details, ip, userAgent) {
    this.logSecurityEvent(SECURITY_EVENTS.SECURITY_VIOLATION, {
      violationType,
      details: this.sanitizeData(details),
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    }, SECURITY_LEVELS.HIGH);
  }

  // Log file operations
  logFileOperation(userId, operation, filename, success, ip) {
    this.logSecurityEvent(SECURITY_EVENTS.FILE_OPERATION, {
      userId,
      operation,
      filename,
      success,
      ip,
      timestamp: new Date().toISOString()
    }, success ? SECURITY_LEVELS.INFO : SECURITY_LEVELS.MEDIUM);
  }

  // Log admin actions
  logAdminAction(adminId, action, target, details, ip) {
    this.logSecurityEvent(SECURITY_EVENTS.ADMIN_ACTION, {
      adminId,
      action,
      target,
      details: this.sanitizeData(details),
      ip,
      timestamp: new Date().toISOString()
    }, SECURITY_LEVELS.MEDIUM);
  }

  // Log system errors
  logSystemError(error, context, userId, ip) {
    this.logger.error('SYSTEM_ERROR', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      userId,
      ip,
      timestamp: new Date().toISOString()
    });
  }

  // Log access events
  logAccess(method, url, statusCode, responseTime, ip, userAgent, userId) {
    this.logger.info('ACCESS', {
      method,
      url,
      statusCode,
      responseTime,
      ip,
      userAgent,
      userId,
      timestamp: new Date().toISOString()
    });
  }

  // Send security alerts for critical events
  sendSecurityAlert(logEntry) {
    // In a production environment, this would send alerts via email, SMS, or webhook
    console.error('🚨 CRITICAL SECURITY EVENT:', JSON.stringify(logEntry, null, 2));
    
    // You could integrate with services like:
    // - Slack webhooks
    // - Email notifications
    // - SMS alerts
    // - Security information and event management (SIEM) systems
  }

  // Get log statistics
  getLogStats() {
    const stats = {
      totalLogs: 0,
      securityEvents: 0,
      errors: 0,
      lastLogTime: null
    };

    try {
      const logFiles = ['security.log', 'error.log', 'access.log', 'audit.log'];
      
      logFiles.forEach(logFile => {
        const logPath = path.join(this.logDir, logFile);
        if (fs.existsSync(logPath)) {
          const content = fs.readFileSync(logPath, 'utf8');
          const lines = content.split('\n').filter(line => line.trim());
          stats.totalLogs += lines.length;
          
          if (logFile === 'security.log') {
            stats.securityEvents = lines.length;
          } else if (logFile === 'error.log') {
            stats.errors = lines.length;
          }
        }
      });
    } catch (error) {
      console.error('Error getting log stats:', error);
    }

    return stats;
  }

  // Clean up old logs (retention policy)
  cleanupOldLogs(daysToKeep = 30) {
    const archiveDir = path.join(this.logDir, 'archive');
    
    if (!fs.existsSync(archiveDir)) {
      return;
    }

    const files = fs.readdirSync(archiveDir);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    files.forEach(file => {
      const filePath = path.join(archiveDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted old log file: ${file}`);
        } catch (error) {
          console.error(`Error deleting old log file ${file}:`, error);
        }
      }
    });
  }
}

// Create singleton instance
const secureLogger = new SecureLogger();

module.exports = {
  secureLogger,
  SECURITY_LEVELS,
  SECURITY_EVENTS
};
