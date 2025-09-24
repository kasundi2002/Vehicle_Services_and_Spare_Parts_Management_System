const fs = require('fs');
const path = require('path');
const { secureLogger } = require('./logger');

class LogMonitor {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.alertThresholds = {
      failedLogins: 5, // Alert after 5 failed logins
      securityViolations: 3, // Alert after 3 security violations
      errors: 10, // Alert after 10 errors in 5 minutes
      suspiciousActivity: 2 // Alert after 2 suspicious activities
    };
    this.monitoringInterval = 60000; // Check every minute
    this.isMonitoring = false;
    this.lastCheckTime = new Date();
  }

  startMonitoring() {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    console.log('🔍 Starting log monitoring...');
    
    // Check logs every minute
    setInterval(() => {
      this.analyzeLogs();
    }, this.monitoringInterval);

    // Initial analysis
    this.analyzeLogs();
  }

  stopMonitoring() {
    this.isMonitoring = false;
    console.log('🛑 Stopped log monitoring');
  }

  analyzeLogs() {
    try {
      const now = new Date();
      const timeWindow = 5 * 60 * 1000; // 5 minutes
      const startTime = new Date(now.getTime() - timeWindow);

      // Analyze different log types
      this.analyzeSecurityLogs(startTime, now);
      this.analyzeErrorLogs(startTime, now);
      this.analyzeAccessLogs(startTime, now);
      this.analyzeAuditLogs(startTime, now);

      this.lastCheckTime = now;
    } catch (error) {
      console.error('Error analyzing logs:', error);
    }
  }

  analyzeSecurityLogs(startTime, endTime) {
    const securityLogPath = path.join(this.logDir, 'security.log');
    
    if (!fs.existsSync(securityLogPath)) {
      return;
    }

    try {
      const logContent = fs.readFileSync(securityLogPath, 'utf8');
      const lines = logContent.split('\n').filter(line => line.trim());
      
      let failedLogins = 0;
      let securityViolations = 0;
      let suspiciousActivities = 0;
      let criticalEvents = 0;

      lines.forEach(line => {
        try {
          const logEntry = JSON.parse(line);
          const logTime = new Date(logEntry.timestamp);
          
          if (logTime >= startTime && logTime <= endTime) {
            if (logEntry.event === 'authentication' && !logEntry.data.success) {
              failedLogins++;
            }
            
            if (logEntry.event === 'security_violation') {
              securityViolations++;
            }
            
            if (logEntry.data.violationType === 'suspicious_input_detected' || 
                logEntry.data.violationType === 'suspicious_query_detected') {
              suspiciousActivities++;
            }
            
            if (logEntry.level === 'critical') {
              criticalEvents++;
            }
          }
        } catch (parseError) {
          // Skip malformed log entries
        }
      });

      // Generate alerts based on thresholds
      if (failedLogins >= this.alertThresholds.failedLogins) {
        this.sendAlert('HIGH', 'Multiple Failed Login Attempts', {
          count: failedLogins,
          timeWindow: '5 minutes',
          recommendation: 'Check for brute force attacks'
        });
      }

      if (securityViolations >= this.alertThresholds.securityViolations) {
        this.sendAlert('HIGH', 'Security Violations Detected', {
          count: securityViolations,
          timeWindow: '5 minutes',
          recommendation: 'Review security logs immediately'
        });
      }

      if (suspiciousActivities >= this.alertThresholds.suspiciousActivity) {
        this.sendAlert('MEDIUM', 'Suspicious Activity Detected', {
          count: suspiciousActivities,
          timeWindow: '5 minutes',
          recommendation: 'Review input validation and filtering'
        });
      }

      if (criticalEvents > 0) {
        this.sendAlert('CRITICAL', 'Critical Security Events', {
          count: criticalEvents,
          timeWindow: '5 minutes',
          recommendation: 'Immediate investigation required'
        });
      }

    } catch (error) {
      console.error('Error analyzing security logs:', error);
    }
  }

  analyzeErrorLogs(startTime, endTime) {
    const errorLogPath = path.join(this.logDir, 'error.log');
    
    if (!fs.existsSync(errorLogPath)) {
      return;
    }

    try {
      const logContent = fs.readFileSync(errorLogPath, 'utf8');
      const lines = logContent.split('\n').filter(line => line.trim());
      
      let errorCount = 0;
      const errorTypes = {};

      lines.forEach(line => {
        try {
          const logEntry = JSON.parse(line);
          const logTime = new Date(logEntry.timestamp);
          
          if (logTime >= startTime && logTime <= endTime) {
            errorCount++;
            
            const errorType = logEntry.error?.name || 'Unknown';
            errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
          }
        } catch (parseError) {
          // Skip malformed log entries
        }
      });

      if (errorCount >= this.alertThresholds.errors) {
        this.sendAlert('MEDIUM', 'High Error Rate Detected', {
          count: errorCount,
          timeWindow: '5 minutes',
          errorTypes,
          recommendation: 'Check system health and error patterns'
        });
      }

    } catch (error) {
      console.error('Error analyzing error logs:', error);
    }
  }

  analyzeAccessLogs(startTime, endTime) {
    const accessLogPath = path.join(this.logDir, 'access.log');
    
    if (!fs.existsSync(accessLogPath)) {
      return;
    }

    try {
      const logContent = fs.readFileSync(accessLogPath, 'utf8');
      const lines = logContent.split('\n').filter(line => line.trim());
      
      let totalRequests = 0;
      let errorRequests = 0;
      const ipCounts = {};
      const endpointCounts = {};

      lines.forEach(line => {
        try {
          const logEntry = JSON.parse(line);
          const logTime = new Date(logEntry.timestamp);
          
          if (logTime >= startTime && logTime <= endTime) {
            totalRequests++;
            
            if (logEntry.statusCode >= 400) {
              errorRequests++;
            }
            
            ipCounts[logEntry.ip] = (ipCounts[logEntry.ip] || 0) + 1;
            endpointCounts[logEntry.url] = (endpointCounts[logEntry.url] || 0) + 1;
          }
        } catch (parseError) {
          // Skip malformed log entries
        }
      });

      // Check for unusual patterns
      const errorRate = totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;
      
      if (errorRate > 50) {
        this.sendAlert('MEDIUM', 'High Error Rate in Access Logs', {
          errorRate: errorRate.toFixed(2) + '%',
          totalRequests,
          errorRequests,
          recommendation: 'Check server health and endpoint availability'
        });
      }

      // Check for potential DDoS (many requests from single IP)
      const maxRequestsFromIP = Math.max(...Object.values(ipCounts));
      if (maxRequestsFromIP > 100) {
        const suspiciousIPs = Object.entries(ipCounts)
          .filter(([ip, count]) => count > 100)
          .map(([ip, count]) => ({ ip, count }));
        
        this.sendAlert('HIGH', 'Potential DDoS Attack Detected', {
          suspiciousIPs,
          recommendation: 'Consider rate limiting or IP blocking'
        });
      }

    } catch (error) {
      console.error('Error analyzing access logs:', error);
    }
  }

  analyzeAuditLogs(startTime, endTime) {
    const auditLogPath = path.join(this.logDir, 'audit.log');
    
    if (!fs.existsSync(auditLogPath)) {
      return;
    }

    try {
      const logContent = fs.readFileSync(auditLogPath, 'utf8');
      const lines = logContent.split('\n').filter(line => line.trim());
      
      let adminActions = 0;
      let dataModifications = 0;
      const userActions = {};

      lines.forEach(line => {
        try {
          const logEntry = JSON.parse(line);
          const logTime = new Date(logEntry.timestamp);
          
          if (logTime >= startTime && logTime <= endTime) {
            if (logEntry.auditType === 'admin_action') {
              adminActions++;
            }
            
            if (logEntry.event === 'data_modification') {
              dataModifications++;
            }
            
            if (logEntry.data?.userId) {
              userActions[logEntry.data.userId] = (userActions[logEntry.data.userId] || 0) + 1;
            }
          }
        } catch (parseError) {
          // Skip malformed log entries
        }
      });

      // Check for unusual admin activity
      if (adminActions > 20) {
        this.sendAlert('MEDIUM', 'High Admin Activity', {
          adminActions,
          timeWindow: '5 minutes',
          recommendation: 'Verify admin actions are legitimate'
        });
      }

      // Check for unusual data modification patterns
      if (dataModifications > 50) {
        this.sendAlert('MEDIUM', 'High Data Modification Activity', {
          dataModifications,
          timeWindow: '5 minutes',
          recommendation: 'Review data modification patterns'
        });
      }

    } catch (error) {
      console.error('Error analyzing audit logs:', error);
    }
  }

  sendAlert(severity, title, details) {
    const alert = {
      timestamp: new Date().toISOString(),
      severity,
      title,
      details,
      source: 'log-monitor'
    };

    // Log the alert
    secureLogger.logSecurityEvent('security_alert', alert, severity.toLowerCase());

    // In production, you would send alerts via:
    // - Email notifications
    // - Slack webhooks
    // - SMS alerts
    // - SIEM systems
    
    console.log(`🚨 ${severity} ALERT: ${title}`, details);
  }

  // Get monitoring statistics
  getMonitoringStats() {
    return {
      isMonitoring: this.isMonitoring,
      lastCheckTime: this.lastCheckTime,
      alertThresholds: this.alertThresholds,
      monitoringInterval: this.monitoringInterval
    };
  }

  // Update alert thresholds
  updateThresholds(newThresholds) {
    this.alertThresholds = { ...this.alertThresholds, ...newThresholds };
    console.log('Updated alert thresholds:', this.alertThresholds);
  }

  // Generate security report
  generateSecurityReport(hours = 24) {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - (hours * 60 * 60 * 1000));

    const report = {
      timeRange: {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        hours
      },
      summary: {
        totalSecurityEvents: 0,
        failedLogins: 0,
        securityViolations: 0,
        suspiciousActivities: 0,
        adminActions: 0,
        dataModifications: 0
      },
      recommendations: []
    };

    // Analyze logs for the specified time period
    // This would be implemented similar to the analyzeLogs methods above
    
    return report;
  }
}

// Create singleton instance
const logMonitor = new LogMonitor();

module.exports = logMonitor;
