const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { secureLogger } = require('../utils/logger');
const logMonitor = require('../utils/logMonitor');

// Middleware to require admin authentication
const requireJwtAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.header('auth-token');
    if (!token) return res.status(401).json({ message: "Auth required" });
    
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = payload?.user || payload?.User || payload?.Admin || payload?.admin || payload;
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Get log statistics
router.get('/stats', requireJwtAuth, (req, res) => {
  try {
    const stats = secureLogger.getLogStats();
    const monitoringStats = logMonitor.getMonitoringStats();
    
    res.json({
      success: true,
      logStats: stats,
      monitoringStats
    });
  } catch (error) {
    console.error('Error getting log stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get log statistics' });
  }
});

// Get security events
router.get('/security', requireJwtAuth, (req, res) => {
  try {
    const { limit = 100, level, event } = req.query;
    const securityLogPath = path.join(__dirname, '../logs/security.log');
    
    if (!fs.existsSync(securityLogPath)) {
      return res.json({ success: true, events: [] });
    }
    
    const logContent = fs.readFileSync(securityLogPath, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim());
    
    let events = lines
      .slice(-parseInt(limit))
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(event => event !== null);
    
    // Filter by level if specified
    if (level) {
      events = events.filter(event => event.level === level);
    }
    
    // Filter by event type if specified
    if (event) {
      events = events.filter(event => event.event === event);
    }
    
    res.json({
      success: true,
      events: events.reverse(), // Most recent first
      total: events.length
    });
  } catch (error) {
    console.error('Error getting security events:', error);
    res.status(500).json({ success: false, error: 'Failed to get security events' });
  }
});

// Get error logs
router.get('/errors', requireJwtAuth, (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const errorLogPath = path.join(__dirname, '../logs/error.log');
    
    if (!fs.existsSync(errorLogPath)) {
      return res.json({ success: true, errors: [] });
    }
    
    const logContent = fs.readFileSync(errorLogPath, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim());
    
    const errors = lines
      .slice(-parseInt(limit))
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(error => error !== null)
      .reverse(); // Most recent first
    
    res.json({
      success: true,
      errors,
      total: errors.length
    });
  } catch (error) {
    console.error('Error getting error logs:', error);
    res.status(500).json({ success: false, error: 'Failed to get error logs' });
  }
});

// Get access logs
router.get('/access', requireJwtAuth, (req, res) => {
  try {
    const { limit = 100, statusCode, method } = req.query;
    const accessLogPath = path.join(__dirname, '../logs/access.log');
    
    if (!fs.existsSync(accessLogPath)) {
      return res.json({ success: true, access: [] });
    }
    
    const logContent = fs.readFileSync(accessLogPath, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim());
    
    let access = lines
      .slice(-parseInt(limit))
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(entry => entry !== null);
    
    // Filter by status code if specified
    if (statusCode) {
      access = access.filter(entry => entry.statusCode === parseInt(statusCode));
    }
    
    // Filter by method if specified
    if (method) {
      access = access.filter(entry => entry.method === method.toUpperCase());
    }
    
    res.json({
      success: true,
      access: access.reverse(), // Most recent first
      total: access.length
    });
  } catch (error) {
    console.error('Error getting access logs:', error);
    res.status(500).json({ success: false, error: 'Failed to get access logs' });
  }
});

// Get audit logs
router.get('/audit', requireJwtAuth, (req, res) => {
  try {
    const { limit = 100, userId } = req.query;
    const auditLogPath = path.join(__dirname, '../logs/audit.log');
    
    if (!fs.existsSync(auditLogPath)) {
      return res.json({ success: true, audit: [] });
    }
    
    const logContent = fs.readFileSync(auditLogPath, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim());
    
    let audit = lines
      .slice(-parseInt(limit))
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(entry => entry !== null);
    
    // Filter by user ID if specified
    if (userId) {
      audit = audit.filter(entry => 
        entry.data?.userId === userId || entry.data?.adminId === userId
      );
    }
    
    res.json({
      success: true,
      audit: audit.reverse(), // Most recent first
      total: audit.length
    });
  } catch (error) {
    console.error('Error getting audit logs:', error);
    res.status(500).json({ success: false, error: 'Failed to get audit logs' });
  }
});

// Generate security report
router.get('/report', requireJwtAuth, (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const report = logMonitor.generateSecurityReport(parseInt(hours));
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error generating security report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate security report' });
  }
});

// Download log file
router.get('/download/:logType', requireJwtAuth, (req, res) => {
  try {
    const { logType } = req.params;
    const allowedTypes = ['security', 'error', 'access', 'audit'];
    
    if (!allowedTypes.includes(logType)) {
      return res.status(400).json({ success: false, error: 'Invalid log type' });
    }
    
    const logPath = path.join(__dirname, `../logs/${logType}.log`);
    
    if (!fs.existsSync(logPath)) {
      return res.status(404).json({ success: false, error: 'Log file not found' });
    }
    
    // Log the download action
    secureLogger.logAdminAction(
      req.user.id,
      'download_log',
      logType,
      { logType },
      req.ip
    );
    
    res.download(logPath, `${logType}_${new Date().toISOString().split('T')[0]}.log`);
  } catch (error) {
    console.error('Error downloading log file:', error);
    res.status(500).json({ success: false, error: 'Failed to download log file' });
  }
});

// Clear old logs
router.delete('/cleanup', requireJwtAuth, (req, res) => {
  try {
    const { days = 30 } = req.body;
    
    // Log the cleanup action
    secureLogger.logAdminAction(
      req.user.id,
      'cleanup_logs',
      'system',
      { days },
      req.ip
    );
    
    secureLogger.cleanupOldLogs(parseInt(days));
    
    res.json({
      success: true,
      message: `Cleaned up logs older than ${days} days`
    });
  } catch (error) {
    console.error('Error cleaning up logs:', error);
    res.status(500).json({ success: false, error: 'Failed to clean up logs' });
  }
});

// Update monitoring thresholds
router.put('/monitoring/thresholds', requireJwtAuth, (req, res) => {
  try {
    const { thresholds } = req.body;
    
    if (!thresholds || typeof thresholds !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid thresholds' });
    }
    
    // Log the threshold update
    secureLogger.logAdminAction(
      req.user.id,
      'update_monitoring_thresholds',
      'system',
      { thresholds },
      req.ip
    );
    
    logMonitor.updateThresholds(thresholds);
    
    res.json({
      success: true,
      message: 'Monitoring thresholds updated',
      thresholds: logMonitor.getMonitoringStats().alertThresholds
    });
  } catch (error) {
    console.error('Error updating monitoring thresholds:', error);
    res.status(500).json({ success: false, error: 'Failed to update monitoring thresholds' });
  }
});

// Get monitoring status
router.get('/monitoring/status', requireJwtAuth, (req, res) => {
  try {
    const stats = logMonitor.getMonitoringStats();
    
    res.json({
      success: true,
      monitoring: stats
    });
  } catch (error) {
    console.error('Error getting monitoring status:', error);
    res.status(500).json({ success: false, error: 'Failed to get monitoring status' });
  }
});

// Start/stop monitoring
router.post('/monitoring/:action', requireJwtAuth, (req, res) => {
  try {
    const { action } = req.params;
    
    if (action === 'start') {
      logMonitor.startMonitoring();
      secureLogger.logAdminAction(
        req.user.id,
        'start_monitoring',
        'system',
        {},
        req.ip
      );
    } else if (action === 'stop') {
      logMonitor.stopMonitoring();
      secureLogger.logAdminAction(
        req.user.id,
        'stop_monitoring',
        'system',
        {},
        req.ip
      );
    } else {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }
    
    res.json({
      success: true,
      message: `Monitoring ${action}ed`,
      monitoring: logMonitor.getMonitoringStats()
    });
  } catch (error) {
    console.error('Error controlling monitoring:', error);
    res.status(500).json({ success: false, error: 'Failed to control monitoring' });
  }
});

module.exports = router;
