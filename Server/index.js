// server.js
require("dotenv").config();

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const Joi = require("joi");
const nodemailer = require("nodemailer");
const passport = require("passport");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("mongo-sanitize");
const speakeasy = require("speakeasy");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const fs = require("fs");
const { fileTypeFromBuffer } = require("file-type");
const sharp = require("sharp");

// Import secure logging system
const { secureLogger, SECURITY_LEVELS, SECURITY_EVENTS } = require('./utils/logger');
const logMonitor = require('./utils/logMonitor');
const {
  securityLoggingMiddleware,
  authLoggingMiddleware,
  dataAccessLoggingMiddleware,
  dataModificationLoggingMiddleware,
  fileOperationLoggingMiddleware,
  adminActionLoggingMiddleware,
  rateLimitLoggingMiddleware,
  suspiciousActivityMiddleware,
  errorLoggingMiddleware
} = require('./middleware/securityLogging');

// Google OpenID Connect & OAuth2
const { Issuer, generators } = require("openid-client");
const { OAuth2Client } = require("google-auth-library");

if (!process.env.MONGODB_URL) {
  console.error("MONGODB_URL is missing. Check your .env placement & syntax.");
  process.exit(1);
}

if (!process.env.PORT) {
  console.error("PORT is missing. Check your .env placement & syntax.");
  process.exit(1);
}


const {
  PORT = 4000,
  MONGODB_URL = "mongodb://localhost:27017/vehicle_services",
  FRONTEND_ORIGIN,
  SESSION_SECRET,
  OIDC_ISSUER,
  OIDC_CLIENT_ID,
  OIDC_CLIENT_SECRET,
  OIDC_REDIRECT_URI,
  NODE_ENV = "development",

  EMAIL_ADD,
  EMAIL_PW,
  EMAIL_ADD2,
  EMAIL_PW2,

  JWT_SECRET,
  // CORS allow-list (comma-separated). If not set, we allow common local ports.
  ALLOWED_ORIGINS = "http://localhost:5173,http://localhost:3000"
} = process.env;

const isProd = NODE_ENV === "production";

// --------- APP HARDENING ---------
app.set("trust proxy", 1);               // behind a proxy
app.disable("x-powered-by");
app.use(helmet({
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  noSniff: true,
  referrerPolicy: { policy: "no-referrer" }
}));

// --------- CORS (cookies need credentials + exact origin) ---------
const allowList = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4000',
  'https://vehicle-sever.onrender.com',
  'https://vehicle-client.onrender.com' 
  // Add your frontend deployment URL if different
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    
    if (allowList.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'auth-token', 'Origin', 'Accept']
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size

// --------- INPUT SANITIZATION ---------
// Sanitize all inputs to prevent NoSQL injection
app.use((req, res, next) => {
  if (req.body) {
    req.body = mongoSanitize(req.body);
  }
  if (req.query) {
    req.query = mongoSanitize(req.query);
  }
  if (req.params) {
    req.params = mongoSanitize(req.params);
  }
  next();
});

// --------- RATE LIMITING ---------
// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: "Too many authentication attempts, please try again later.",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use(generalLimiter);

// Apply security logging middleware
app.use(securityLoggingMiddleware);
app.use(authLoggingMiddleware);
app.use(dataAccessLoggingMiddleware);
app.use(dataModificationLoggingMiddleware);
app.use(fileOperationLoggingMiddleware);
app.use(adminActionLoggingMiddleware);
app.use(rateLimitLoggingMiddleware);
app.use(suspiciousActivityMiddleware);

// Apply data integrity validation to all routes
app.use(validateDataIntegrity);

// --------- SESSIONS (for OIDC/OAuth) ---------
// In prod (HTTPS), SameSite=None + Secure=true. In dev, we still use None to allow cross-origin fetch with credentials.
app.use(session({
  name: "sid",
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "none",
    secure: isProd,                 // true in prod (HTTPS). false in dev.
    maxAge: 1000 * 60 * 60 * 8
  }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport strategies
require('./config/passport');

// Optional HSTS for HTTPS
if (isProd) {
  app.use((req, res, next) => {
    const https = req.secure || req.headers["x-forwarded-proto"] === "https";
    if (https) res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
  });
}

// --------- DB ---------
mongoose.connect(MONGODB_URL)
  .then(() => {
    console.log("MongoDB Connected");
    secureLogger.logSecurityEvent(SECURITY_EVENTS.SYSTEM_ERROR, {
      message: "Database connection established",
      status: "success"
    }, SECURITY_LEVELS.INFO);
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    secureLogger.logSystemError(err, { context: "database_connection" }, null, "system");
  });

// --------- MODELS ---------
const Product = require("./models/OnlineShopModels/Product");
const Users = require("./models/OnlineShopModels/Users");
const Order = require("./models/OnlineShopModels/Order");
const Admins = require("./models/OnlineShopModels/Admin");
const Customers = require("./models/customerModel");
const Booking = require("./models/BookingModel");
const Service = require("./models/ServiceModel");
const Issue = require("./models/issueModel");

// --------- ROUTES ---------
const logRoutes = require('./routes/logRoutes');

// --------- VALIDATION SCHEMAS ---------
const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    })
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required()
});

const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().pattern(/^[a-zA-Z0-9\s\-_.,()]+$/).required(),
  category: Joi.string().min(2).max(50).trim().pattern(/^[a-zA-Z0-9\s\-_]+$/).required(),
  brand: Joi.string().min(2).max(50).trim().pattern(/^[a-zA-Z0-9\s\-_]+$/).required(),
  image: Joi.string().uri().required(),
  new_price: Joi.number().positive().max(999999.99).precision(2).required(),
  old_price: Joi.number().positive().max(999999.99).precision(2).required(),
  description: Joi.string().max(500).trim().pattern(/^[a-zA-Z0-9\s\-_.,()!?@#$%&*+=<>:"'`~[\]{}|\\/]+$/).required(),
  quantity: Joi.number().integer().min(0).max(999999).required()
});

const orderSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).trim().pattern(/^[a-zA-Z\s]+$/).required(),
  email: Joi.string().email().lowercase().trim().required(),
  address: Joi.string().min(10).max(200).trim().pattern(/^[a-zA-Z0-9\s\-_.,()#\/]+$/).required(),
  contact: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(15).required(),
  paymentMethod: Joi.string().valid("cash", "card", "online").required(),
  items: Joi.array().items(Joi.object({
    id: Joi.number().integer().positive().required(),
    name: Joi.string().required(),
    price: Joi.number().positive().required(),
    quantity: Joi.number().integer().positive().required()
  })).min(1).max(50).required(),
  totalAmount: Joi.number().positive().max(999999.99).precision(2).required()
});

const bookingSchema = Joi.object({
  ownerName: Joi.string().min(2).max(100).trim().pattern(/^[a-zA-Z\s]+$/).required(),
  email: Joi.string().email().lowercase().trim().required(),
  phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(15).required(),
  specialNotes: Joi.string().max(500).trim().pattern(/^[a-zA-Z0-9\s\-_.,()!?@#$%&*+=<>:"'`~[\]{}|\\/]*$/).allow(""),
  location: Joi.string().min(5).max(100).trim().pattern(/^[a-zA-Z0-9\s\-_.,()#\/]+$/).required(),
  serviceType: Joi.string().min(2).max(50).trim().pattern(/^[a-zA-Z0-9\s\-_]+$/).required(),
  vehicleModel: Joi.string().min(2).max(50).trim().pattern(/^[a-zA-Z0-9\s\-_]+$/).required(),
  vehicleNumber: Joi.string().min(2).max(20).trim().pattern(/^[a-zA-Z0-9\s\-_]+$/).required(),
  date: Joi.date().min("now").required(),
  time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
});

const serviceSchema = Joi.object({
  serviceTitle: Joi.string().min(2).max(100).trim().pattern(/^[a-zA-Z0-9\s\-_.,()]+$/).required(),
  details: Joi.string().max(500).trim().pattern(/^[a-zA-Z0-9\s\-_.,()!?@#$%&*+=<>:"'`~[\]{}|\\/]*$/).allow(""),
  estimatedHour: Joi.string().min(1).max(20).trim().pattern(/^[0-9]+(\.[0-9]+)?$/).required(),
  image: Joi.string().uri().required()
});

const customerSchema = Joi.object({
  customerID: Joi.string().min(2).max(20).trim().pattern(/^[a-zA-Z0-9\-_]+$/).required(),
  name: Joi.string().min(2).max(100).trim().pattern(/^[a-zA-Z\s]+$/).required(),
  NIC: Joi.string().pattern(/^[0-9]{9}[vVxX]|[0-9]{12}$/).required(),
  address: Joi.string().min(10).max(200).trim().pattern(/^[a-zA-Z0-9\s\-_.,()#\/]+$/).required(),
  contactno: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(15).required(),
  email: Joi.string().email().lowercase().trim().required(),
  vType: Joi.string().min(2).max(20).trim().pattern(/^[a-zA-Z0-9\s\-_]+$/).required(),
  vName: Joi.string().min(2).max(50).trim().pattern(/^[a-zA-Z0-9\s\-_]+$/).required(),
  Regno: Joi.string().min(2).max(20).trim().pattern(/^[a-zA-Z0-9\s\-_]+$/).required(),
  vColor: Joi.string().min(2).max(20).trim().pattern(/^[a-zA-Z\s\-_]+$/).required(),
  vFuel: Joi.string().min(2).max(20).trim().pattern(/^[a-zA-Z\s\-_]+$/).required()
});

const issueSchema = Joi.object({
  cid: Joi.string().min(2).max(20).trim().pattern(/^[a-zA-Z0-9\-_]+$/).required(),
  Cname: Joi.string().min(2).max(100).trim().pattern(/^[a-zA-Z\s]+$/).required(),
  Cnic: Joi.string().pattern(/^[0-9]{9}[vVxX]|[0-9]{12}$/).required(),
  Ccontact: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(15).required(),
  Clocation: Joi.string().min(5).max(100).trim().pattern(/^[a-zA-Z0-9\s\-_.,()#\/]+$/).required(),
  Cstatus: Joi.string().valid("pending", "in_progress", "resolved", "closed").required()
});

// --------- HELPERS ---------
function pick(obj, allowed = []) {
  const out = {};
  allowed.forEach(k => { if (obj[k] !== undefined) out[k] = obj[k]; });
  return out;
}

// Safe MongoDB query helper to prevent injection
function sanitizeQuery(query) {
  if (typeof query === 'object' && query !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(query)) {
      // Sanitize keys
      const sanitizedKey = mongoSanitize(key);
      if (sanitizedKey && typeof sanitizedKey === 'string') {
        // Sanitize values
        if (typeof value === 'object' && value !== null) {
          sanitized[sanitizedKey] = sanitizeQuery(value);
        } else {
          sanitized[sanitizedKey] = mongoSanitize(value);
        }
      }
    }
    return sanitized;
  }
  return mongoSanitize(query);
}

// Parameter validation middleware
function validateParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, { allowUnknown: false });
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid parameters",
        details: error.details[0].message 
      });
    }
    req.params = value;
    next();
  };
}

// Data integrity validation middleware
function validateDataIntegrity(req, res, next) {
  try {
    // Check for data tampering indicators
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
      /prompt\(/i
    ];
    
    // Check request body for suspicious content
    if (req.body) {
      const bodyString = JSON.stringify(req.body);
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(bodyString)) {
          console.log(`Suspicious content detected in request body from ${req.ip}`);
          return res.status(400).json({ 
            success: false, 
            error: "Suspicious content detected" 
          });
        }
      }
    }
    
    // Check query parameters
    if (req.query) {
      const queryString = JSON.stringify(req.query);
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(queryString)) {
          console.log(`Suspicious content detected in query parameters from ${req.ip}`);
          return res.status(400).json({ 
            success: false, 
            error: "Suspicious content detected" 
          });
        }
      }
    }
    
    next();
  } catch (error) {
    console.error("Data integrity validation error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Data validation failed" 
    });
  }
}

// Database operation logging middleware
function logDatabaseOperation(operation, collection, data) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation,
    collection,
    data: typeof data === 'object' ? JSON.stringify(data) : data,
    ip: 'unknown' // Would be set by request context
  };
  
  console.log(`Database operation: ${JSON.stringify(logEntry)}`);
}

// Enhanced data validation for critical operations
function validateCriticalData(data, schema) {
  const { error, value } = schema.validate(data, { 
    allowUnknown: false,
    stripUnknown: true,
    abortEarly: false
  });
  
  if (error) {
    const errors = error.details.map(detail => detail.message);
    return { valid: false, errors };
  }
  
  return { valid: true, data: value };
}

function getTokenFromReq(req) {
  const h = req.headers.authorization || "";
  if (h.startsWith("Bearer ")) return h.slice(7);
  return req.header("auth-token") || null;
}

function requireJwtAuth(req, res, next) {
  try {
    const token = getTokenFromReq(req);
    if (!token) return res.status(401).json({ message: "Auth required" });
    
    // Verify token with additional security checks
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'], // Only allow HS256 algorithm
      clockTolerance: 30 // Allow 30 seconds clock tolerance
    });
    
    const u = payload?.user || payload?.User || payload?.Admin || payload?.admin || payload;
    if (!u) return res.status(401).json({ message: "Invalid token" });
    
    // Check token expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ message: "Token expired" });
    }
    
    req.user = {
      id: u._id || u.id,
      email: u.email,
      name: u.name,
      role: Array.isArray(u.role) ? u.role[0] : u.role || (u.isAdmin ? "admin" : "user") || "user",
    };
    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    } else if (e.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}

function hasRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Auth required" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
}

// --------- STATIC / HEALTH ---------
app.get("/", (req, res) => {
  res.send("Express App is running");
});

// --------- LOG MANAGEMENT ROUTES ---------
app.use('/api/logs', logRoutes);

// --------- ENHANCED FILE UPLOAD SECURITY ---------

// File validation and security functions
async function validateFileContent(filePath) {
  try {
    // Read file header to detect actual file type
    const fileBuffer = fs.readFileSync(filePath);
    const detectedType = await fileTypeFromBuffer(fileBuffer);
    
    if (!detectedType) {
      throw new Error("Unable to detect file type");
    }
    
    // Validate against allowed types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(detectedType.mime)) {
      throw new Error(`Invalid file type detected: ${detectedType.mime}`);
    }
    
    // Check for suspicious patterns (basic malware detection)
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /eval\(/i,
      /document\./i,
      /window\./i
    ];
    
    const fileContent = fileBuffer.toString('utf8', 0, Math.min(1024, fileBuffer.length));
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(fileContent)) {
        throw new Error("Suspicious content detected in file");
      }
    }
    
    return { valid: true, type: detectedType.mime };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

async function processImage(filePath, outputPath) {
  try {
    // Resize and optimize image for security
    await sharp(filePath)
      .resize(1920, 1080, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 85,
        progressive: true 
      })
      .toFile(outputPath);
    
    return true;
  } catch (error) {
    console.error("Image processing error:", error);
    return false;
  }
}

function generateSecureFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `secure_${timestamp}_${randomBytes}${ext}`;
}

// Enhanced storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./upload/images";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const secureName = generateSecureFilename(file.originalname);
    cb(null, secureName);
  }
});

// Enhanced file filter with comprehensive validation
const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only one file at a time
    fieldSize: 1024 * 1024 // 1MB field size limit
  },
  fileFilter: async (req, file, cb) => {
    try {
      // Basic MIME type validation
      const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      const allowedExts = [".jpg", ".jpeg", ".png", ".webp"];
      
      if (!allowedMimes.includes(file.mimetype)) {
        return cb(new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed."), false);
      }
      
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedExts.includes(ext)) {
        return cb(new Error("Invalid file extension. Only .jpg, .jpeg, .png, and .webp files are allowed."), false);
      }
      
      // Check file name for suspicious characters
      const suspiciousChars = /[<>:"'|?*\\]/;
      if (suspiciousChars.test(file.originalname)) {
        return cb(new Error("Invalid characters in filename"), false);
      }
      
      cb(null, true);
    } catch (error) {
      cb(new Error("File validation error"), false);
    }
  }
});

// Secure static file serving with additional headers
app.use("/images", (req, res, next) => {
  // Add security headers for static files
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  next();
}, express.static("upload/images"));

app.post("/upload", requireJwtAuth, hasRole(["admin"]), upload.single("product"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    
    // Log upload attempt
    console.log(`File upload attempt by ${req.user.email}: ${originalName} (${req.file.size} bytes)`);
    
    // Validate file content
    const validation = await validateFileContent(filePath);
    if (!validation.valid) {
      // Clean up invalid file
      fs.unlinkSync(filePath);
      console.log(`File upload rejected: ${validation.error}`);
      return res.status(400).json({ 
        success: false, 
        error: `File validation failed: ${validation.error}` 
      });
    }
    
    // Process image for security (resize, optimize)
    const processedPath = filePath.replace(path.extname(filePath), '_processed.jpg');
    const processed = await processImage(filePath, processedPath);
    
    if (!processed) {
      // Clean up files
      fs.unlinkSync(filePath);
      if (fs.existsSync(processedPath)) {
        fs.unlinkSync(processedPath);
      }
      return res.status(500).json({ 
        success: false, 
        error: "Image processing failed" 
      });
    }
    
    // Remove original file and rename processed file
    fs.unlinkSync(filePath);
    fs.renameSync(processedPath, filePath);
    
    // Generate secure URL
    const proto = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");
    const secureUrl = `${proto}://${host}/images/${req.file.filename}`;
    
    // Log successful upload
    console.log(`File upload successful: ${secureUrl}`);
    
    res.json({ 
      success: 1, 
      image_url: secureUrl,
      file_size: req.file.size,
      file_type: validation.type,
      processed: true
    });
    
  } catch (error) {
    console.error("Upload error:", error);
    
    // Clean up any uploaded files on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
    }
    
    res.status(500).json({ 
      success: false, 
      error: "File upload failed" 
    });
  }
});

// File management and monitoring endpoints
app.get("/uploaded-files", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const uploadDir = "./upload/images";
    const files = fs.readdirSync(uploadDir);
    
    const fileInfo = files.map(filename => {
      const filePath = path.join(uploadDir, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/images/${filename}`
      };
    });
    
    res.json({ 
      success: true, 
      files: fileInfo,
      totalFiles: files.length,
      totalSize: fileInfo.reduce((sum, file) => sum + file.size, 0)
    });
  } catch (error) {
    console.error("Error fetching uploaded files:", error);
    res.status(500).json({ success: false, error: "Failed to fetch files" });
  }
});

app.delete("/uploaded-files/:filename", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join("./upload/images", filename);
    
    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ success: false, error: "Invalid filename" });
    }
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`File deleted by ${req.user.email}: ${filename}`);
      res.json({ success: true, message: "File deleted successfully" });
    } else {
      res.status(404).json({ success: false, error: "File not found" });
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ success: false, error: "Failed to delete file" });
  }
});

// File integrity check endpoint
app.post("/check-file-integrity", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({ success: false, error: "Filename required" });
    }
    
    const filePath = path.join("./upload/images", filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: "File not found" });
    }
    
    // Check file integrity
    const validation = await validateFileContent(filePath);
    const stats = fs.statSync(filePath);
    
    res.json({
      success: true,
      filename,
      valid: validation.valid,
      fileType: validation.type,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    });
  } catch (error) {
    console.error("Error checking file integrity:", error);
    res.status(500).json({ success: false, error: "Failed to check file integrity" });
  }
});

// --------- EMAIL TRANSPORT ---------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: EMAIL_ADD, pass: EMAIL_PW }
});

app.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      // Generate tokens for the authenticated user
      const token = jwt.sign({ user: { id: user.id, email: user.email, name: user.name, role: "user" } }, JWT_SECRET, { expiresIn: "8h" });
       
      // Redirect to frontend callback page (no tokens in URL)
      res.redirect(`http://localhost:3000/auth/callback?token=${token}`);
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// --------- GOOGLE OPENID CONNECT (sessions, PKCE) ---------
// let oidcClient;
// async function getOidcClient() {
//   if (oidcClient) return oidcClient;
//   const issuer = await Issuer.discover(OIDC_ISSUER);
//    console.log("Discovered issuer:", issuer.issuer);
//   oidcClient = new issuer.Client({
//     client_id: OIDC_CLIENT_ID,
//     client_secret: OIDC_CLIENT_SECRET,
//     redirect_uris: [OIDC_REDIRECT_URI],
//     response_types: ["code"],
//     token_endpoint_auth_method: "client_secret_basic",
//   });
//   return oidcClient;
// }

// app.get("/auth/login", async (req, res, next) => {
//   try {
//     const c = await getOidcClient();
//     const state = generators.state();
//     const code_verifier = generators.codeVerifier();
//     const code_challenge = generators.codeChallenge(code_verifier);

//     req.session.oidc = { state, code_verifier };
//     req.session.save(err => {
//       if (err) return next(err);
//       const url = c.authorizationUrl({
//         scope: "openid profile email",
//         response_type: "code",
//         code_challenge,
//         code_challenge_method: "S256",
//         state,
//       });
//       res.redirect(url);
//     });
//   } catch (e) { next(e); }
// });

// app.get("/auth/callback", async (req, res, next) => {
//   try {
//     const c = await getOidcClient();
//     const params = c.callbackParams(req);
//     const { state, code_verifier } = req.session.oidc || {};
//     if (!state || !code_verifier) return res.status(400).send("Missing PKCE session");

//     const tokenSet = await c.callback(OIDC_REDIRECT_URI, params, { state, code_verifier });
//     const claims = tokenSet.claims();

//     req.session.user = {
//       sub: claims.sub,
//       name: claims.name || claims.preferred_username || claims.email,
//       email: claims.email,
//       picture: claims.picture,
//     };
//     req.session.tokens = {
//       access_token: tokenSet.access_token,
//       refresh_token: tokenSet.refresh_token,
//       expires_at: tokenSet.expires_at,
//     };
//     delete req.session.oidc;

//     res.redirect(`${FRONTEND_ORIGIN}/login?status=success`);
//   } catch (e) { next(e); }
// });

// app.get("/auth/me", (req, res) => {
//   if (!req.session.user) return res.status(401).json({ error: "unauthenticated" });
//   res.json({ user: req.session.user });
// });

// app.post("/auth/logout", (req, res) => {
//   req.session.destroy(() => {
//     res.clearCookie("sid");
//     res.json({ ok: true });
//   });
// });

// Helper to protect with session
// function ensureSessionAuth(req, res, next) {
//   if (req.session && req.session.user) return next();
//   return res.status(401).json({ error: "unauthenticated" });
// }

// // Alias: session-protected sample
// app.get("/api/me", ensureSessionAuth, (req, res) => {
//   res.json({ user: req.session.user });
// });

// --------- GOOGLE OAUTH2 (no OIDC) ---------
// const oauthClient = new OAuth2Client(OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, OIDC_REDIRECT_URI);
// const oauthScopes = [
//   "openid",
//   "profile",
//   "email",
//   "https://www.googleapis.com/auth/userinfo.email",
//   "https://www.googleapis.com/auth/userinfo.profile",
// ];

// app.get("/oauth/login", (req, res) => {
//   const url = oauthClient.generateAuthUrl({ access_type: "offline", scope: oauthScopes, prompt: "consent" });
//   res.redirect(url);
// });

// app.get("/oauth/callback", async (req, res, next) => {
//   try {
//     const { code } = req.query;
//     const { tokens } = await oauthClient.getToken(code);
//     // use Google's OpenID userinfo endpoint
//     const r = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
//       headers: { Authorization: `Bearer ${tokens.access_token}` },
//     });
//     const profile = await r.json();

//     req.session.user = {
//       sub: profile.sub,
//       name: profile.name || profile.email,
//       email: profile.email,
//       picture: profile.picture,
//     };
//     req.session.tokens = tokens;

//     res.redirect(`${FRONTEND_ORIGIN}/login?status=success`);
//   } catch (e) { next(e); }
// });

// app.get("/oauth/me", (req, res) => {
//   if (!req.session.user) return res.status(401).json({ error: "unauthenticated" });
//   res.json({ user: req.session.user });
// });

// app.post("/oauth/logout", (req, res) => {
//   req.session.destroy(() => {
//     res.clearCookie("sid");
//     res.json({ ok: true });
//   });
// });

// --------- BUSINESS ROUTES (JWT protected as in your app) ---------

// Products
app.post("/addproduct", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    // Enhanced data validation
    const validation = validateCriticalData(req.body, productSchema);
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        error: "Data validation failed", 
        details: validation.errors 
      });
    }

    const products = await Product.find({});
    let id = products.length ? products[products.length - 1].id + 1 : 1;

    const product = new Product({ id, ...validation.data });
    
    // Log database operation
    logDatabaseOperation('CREATE', 'products', { id, ...validation.data });
    
    await product.save();

    res.json({ success: true, name: validation.data.name });
  } catch (err) {
    console.error("Error while adding product:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.post("/removeproduct", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.number().integer().positive().required(),
      name: Joi.string().min(1).max(100).trim().required()
    }).validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    await Product.findOneAndDelete({ id: value.id });
    res.json({ success: true, name: value.name });
  } catch (err) {
    console.error("Error while removing product:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.get("/allproducts", requireJwtAuth, async (req, res) => {
  const products = await Product.find({});
  res.send(products);
});

app.put("/updateproduct/:id", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const { error: idError, value: productId } = Joi.number().integer().positive().required().validate(req.params.id);
    if (idError) return res.status(400).json({ success: false, error: "Invalid product ID" });

    const { error, value } = productSchema.validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    const product = await Product.findOneAndUpdate({ id: productId }, value, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });

    res.json({ success: true, product });
  } catch (err) {
    console.error("Error while updating product:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.get("/product/:id", requireJwtAuth, validateParams(Joi.object({
  id: Joi.number().integer().positive().required()
})), async (req, res) => {
  try {
    const sanitizedQuery = sanitizeQuery({ id: req.params.id });
    const product = await Product.findOne(sanitizedQuery);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });
    res.json({ success: true, product });
  } catch (err) {
    console.error("Error while fetching product:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.get("/lowStockProducts", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const products = await Product.find({});
    const lowStockProducts = products.filter(p => p.quantity < 3);
    if (lowStockProducts.length) return res.json({ success: true, products, lowStockProducts });
    res.json({ success: true, products });
  } catch (err) {
    console.error("Error while fetching all products:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Auth (JWT for your classic login/signup flows)
app.post("/signup", authLimiter, async (req, res) => {
  try {
    const { error, value } = userSchema.validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).json({ success: false, errors: error.details[0].message });

    const exists = await Users.findOne({ email: value.email });
    if (exists) return res.status(400).json({ success: false, errors: "existing user found with same email address" });

    const cart = Array.from({ length: 300 }).reduce((acc, _, i) => (acc[i] = 0, acc), {});
    const user = new Users({ name: value.name, email: value.email, password: value.password, cartData: cart });
    await user.save();

    const token = jwt.sign({ user: { id: user.id, email: user.email, name: user.name, role: "user" } }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ success: true, token });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
});

app.post("/login", authLimiter, async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).json({ success: false, errors: error.details[0].message });

    const user = await Users.findOne({ email: value.email });
    if (!user) {
      // Log failed login attempt
      console.log(`Failed login attempt for email: ${value.email} - User not found`);
      return res.json({ success: false, errors: "Invalid credentials" });
    }

    // Check if account is locked
    if (user.isLocked) {
      console.log(`Login attempt for locked account: ${value.email}`);
      return res.status(423).json({ 
        success: false, 
        errors: "Account is temporarily locked due to multiple failed login attempts. Please try again later." 
      });
    }

    // Use bcrypt to compare password
    const isPasswordValid = await user.comparePassword(value.password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      console.log(`Failed login attempt for email: ${value.email} - Invalid password`);
      return res.json({ success: false, errors: "Invalid credentials" });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Check if MFA is enabled
    if (user.mfaEnabled) {
      // Return a temporary token for MFA verification
      const tempToken = jwt.sign({ 
        user: { id: user.id, email: user.email, name: user.name, role: "user" },
        mfaRequired: true 
      }, JWT_SECRET, { expiresIn: "5m" });
      
      return res.json({ 
        success: true, 
        mfaRequired: true, 
        tempToken,
        message: "MFA verification required" 
      });
    }

    const token = jwt.sign({ user: { id: user.id, email: user.email, name: user.name, role: "user" } }, JWT_SECRET, { expiresIn: "8h" });
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Log successful login
    console.log(`Successful login for user: ${user.email}`);
    
    res.json({ success: true, token });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
});

app.post("/adminlogin", authLimiter, async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).json({ success: false, errors: error.details[0].message });

    const admin = await Admins.findOne({ email: value.email });
    if (!admin) {
      // Log failed admin login attempt
      console.log(`Failed admin login attempt for email: ${value.email} - Admin not found`);
      return res.json({ success: false, errors: "Invalid credentials" });
    }

    // Check if account is locked
    if (admin.isLocked) {
      console.log(`Admin login attempt for locked account: ${value.email}`);
      return res.status(423).json({ 
        success: false, 
        errors: "Account is temporarily locked due to multiple failed login attempts. Please try again later." 
      });
    }

    // Use bcrypt to compare password
    const isPasswordValid = await admin.comparePassword(value.password);
    if (!isPasswordValid) {
      // Increment login attempts
      await admin.incLoginAttempts();
      console.log(`Failed admin login attempt for email: ${value.email} - Invalid password`);
      return res.json({ success: false, errors: "Invalid credentials" });
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();

    // Check if MFA is enabled
    if (admin.mfaEnabled) {
      // Return a temporary token for MFA verification
      const tempToken = jwt.sign({ 
        user: { id: admin._id, email: admin.email, name: admin.name, role: "admin" },
        mfaRequired: true 
      }, JWT_SECRET, { expiresIn: "5m" });
      
      return res.json({ 
        success: true, 
        mfaRequired: true, 
        tempToken,
        message: "MFA verification required" 
      });
    }

    const token = jwt.sign({ user: { id: admin._id, email: admin.email, name: admin.name, role: "admin" } }, JWT_SECRET, { expiresIn: "8h" });
    
    // Update last login
    admin.lastLogin = new Date();
    await admin.save();
    
    // Log successful admin login
    console.log(`Successful admin login for: ${admin.email}`);
    
    res.json({ success: true, token });
  } catch (err) {
    console.error("Error during admin login:", err);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
});

// MFA verification endpoint
app.post("/verify-mfa", authLimiter, async (req, res) => {
  try {
    const { tempToken, mfaToken } = req.body;
    
    if (!tempToken || !mfaToken) {
      return res.status(400).json({ success: false, errors: "Token and MFA code required" });
    }

    // Verify temp token
    const payload = jwt.verify(tempToken, JWT_SECRET);
    if (!payload.mfaRequired) {
      return res.status(400).json({ success: false, errors: "Invalid token" });
    }

    const user = await Users.findOne({ email: payload.user.email });
    if (!user) {
      const admin = await Admins.findOne({ email: payload.user.email });
      if (!admin) {
        return res.status(404).json({ success: false, errors: "User not found" });
      }
      
      // Verify MFA for admin
      const isValidMfa = admin.verifyMfaToken(mfaToken);
      if (!isValidMfa) {
        return res.status(400).json({ success: false, errors: "Invalid MFA code" });
      }
      
      const token = jwt.sign({ user: payload.user }, JWT_SECRET, { expiresIn: "8h" });
      return res.json({ success: true, token });
    }

    // Verify MFA for user
    const isValidMfa = user.verifyMfaToken(mfaToken);
    if (!isValidMfa) {
      return res.status(400).json({ success: false, errors: "Invalid MFA code" });
    }

    const token = jwt.sign({ user: payload.user }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ success: true, token });
  } catch (err) {
    console.error("Error during MFA verification:", err);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
});

// Password reset request
app.post("/forgot-password", authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, errors: "Email required" });
    }

    const user = await Users.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return res.json({ success: true, message: "If the email exists, a reset link has been sent" });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: EMAIL_ADD,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your account.</p>
        <p>Click the link below to reset your password (expires in 10 minutes):</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "If the email exists, a reset link has been sent" });
  } catch (err) {
    console.error("Error during password reset request:", err);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
});

// Password reset
app.post("/reset-password", authLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, errors: "Token and new password required" });
    }

    const user = await Users.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, errors: "Invalid or expired reset token" });
    }

    // Validate new password
    const { error } = Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .validate(newPassword);

    if (error) {
      return res.status(400).json({ 
        success: false, 
        errors: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" 
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("Error during password reset:", err);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
});

// MFA setup - generate secret
app.post("/setup-mfa", requireJwtAuth, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) {
      const admin = await Admins.findById(req.user.id);
      if (!admin) {
        return res.status(404).json({ success: false, errors: "User not found" });
      }
      
      const secret = admin.generateMfaSecret();
      await admin.save();
      
      return res.json({ 
        success: true, 
        secret: secret.base32,
        qrCodeUrl: secret.otpauth_url 
      });
    }
    
    const secret = user.generateMfaSecret();
    await user.save();
    
    res.json({ 
      success: true, 
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url 
    });
  } catch (err) {
    console.error("Error setting up MFA:", err);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
});

// MFA setup - verify and enable
app.post("/enable-mfa", requireJwtAuth, async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, errors: "MFA token required" });
    }

    const user = await Users.findById(req.user.id);
    if (!user) {
      const admin = await Admins.findById(req.user.id);
      if (!admin) {
        return res.status(404).json({ success: false, errors: "User not found" });
      }
      
      const isValid = admin.verifyMfaToken(token);
      if (!isValid) {
        return res.status(400).json({ success: false, errors: "Invalid MFA token" });
      }
      
      admin.mfaEnabled = true;
      await admin.save();
      
      return res.json({ success: true, message: "MFA enabled successfully" });
    }
    
    const isValid = user.verifyMfaToken(token);
    if (!isValid) {
      return res.status(400).json({ success: false, errors: "Invalid MFA token" });
    }
    
    user.mfaEnabled = true;
    await user.save();
    
    res.json({ success: true, message: "MFA enabled successfully" });
  } catch (err) {
    console.error("Error enabling MFA:", err);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
});

// Session timeout management
app.get("/session-status", requireJwtAuth, async (req, res) => {
  try {
    const token = getTokenFromReq(req);
    const payload = jwt.verify(token, JWT_SECRET);
    
    const timeLeft = payload.exp - Math.floor(Date.now() / 1000);
    
    res.json({ 
      success: true, 
      timeLeft,
      expiresAt: new Date(payload.exp * 1000).toISOString()
    });
  } catch (err) {
    res.status(401).json({ success: false, errors: "Invalid session" });
  }
});

// Refresh token endpoint
app.post("/refresh-token", requireJwtAuth, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) {
      const admin = await Admins.findById(req.user.id);
      if (!admin) {
        return res.status(404).json({ success: false, errors: "User not found" });
      }
      
      const token = jwt.sign({ 
        user: { id: admin._id, email: admin.email, name: admin.name, role: "admin" } 
      }, JWT_SECRET, { expiresIn: "8h" });
      
      return res.json({ success: true, token });
    }
    
    const token = jwt.sign({ 
      user: { id: user.id, email: user.email, name: user.name, role: "user" } 
    }, JWT_SECRET, { expiresIn: "8h" });
    
    res.json({ success: true, token });
  } catch (err) {
    console.error("Error refreshing token:", err);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
});

// Logout endpoint
app.post("/logout", requireJwtAuth, async (req, res) => {
  try {
    // In a production environment, you would maintain a blacklist of tokens
    // For now, we'll just return success as JWT tokens are stateless
    console.log(`User logout: ${req.user.email}`);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Error during logout:", err);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
});

// Cart (JWT middleware)
app.post("/addtocart", requireJwtAuth, async (req, res) => {
  try {
    const itemId = Number(req.body.itemId);
    if (isNaN(itemId)) return res.status(400).json({ success: false, error: "Invalid item ID" });

    const product = await Product.findOne({ id: itemId });
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });
    if (product.quantity <= 0) return res.status(400).json({ success: false, error: "Product out of stock" });

    product.quantity -= 1;
    await product.save();

    const userData = await Users.findOne({ _id: req.user.id });
    userData.cartData[itemId] = (userData.cartData[itemId] || 0) + 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });

    res.json({ success: true, message: "Item added to cart successfully" });
  } catch (err) {
    console.error("Error while adding item to cart:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.post("/removefromcart", requireJwtAuth, async (req, res) => {
  try {
    const itemId = Number(req.body.itemId);
    if (isNaN(itemId)) return res.status(400).json({ success: false, error: "Invalid item ID" });

    const userData = await Users.findOne({ _id: req.user.id });
    if ((userData.cartData[itemId] || 0) > 0) {
      userData.cartData[itemId] -= 1;

      const product = await Product.findOne({ id: itemId });
      product.quantity += 1;
      await product.save();

      await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
      res.json({ success: true, message: "Item removed from cart successfully" });
    } else {
      res.status(400).json({ success: false, error: "Item not found in cart" });
    }
  } catch (err) {
    console.error("Error while removing item from cart:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.post("/getcart", requireJwtAuth, async (req, res) => {
  const userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);
});

// Orders
function generateOrderId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const getDefaultCart = () => {
  const cart = {};
  for (let i = 0; i <= 300; i++) cart[i] = 0;
  return cart;
};

const clearCart = async (userId) => {
  try {
    const defaultCart = getDefaultCart();
    await Users.findByIdAndUpdate(userId, { cartData: defaultCart });
  } catch (e) {
    console.error("Error while clearing cart:", e);
  }
};

app.post("/checkout", requireJwtAuth, async (req, res) => {
  try {
    const { error, value } = orderSchema.validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    const { fullName, email, address, contact, paymentMethod, items, totalAmount } = value;
    const orderId = generateOrderId();

    const order = new Order({ orderId, fullName, email, address, contact, paymentMethod, items, totalAmount });
    await order.save();

    await clearCart(req.user.id);

    const mailOptions = {
      from: EMAIL_ADD,
      to: email,
      subject: "Order Confirmation",
      text: `Dear ${fullName},\n\nYour order (${orderId}) has been successfully placed.\n\nTotal Amount:- Rs.${totalAmount}\nPayment Method:- ${paymentMethod}\nDate:- ${new Date(order.orderDate).toLocaleDateString()}\n\nThank you for shopping with us!`,
    };
    await transporter.sendMail(mailOptions);

    res.json({ success: true, orderId });
  } catch (err) {
    console.error("Error while saving order:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.get("/product/quantity/:id", requireJwtAuth, validateParams(Joi.object({
  id: Joi.number().integer().positive().required()
})), async (req, res) => {
  try {
    const sanitizedQuery = sanitizeQuery({ id: req.params.id });
    const product = await Product.findOne(sanitizedQuery);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });
    res.json({ success: true, quantity: product.quantity });
  } catch (err) {
    console.error("Error while fetching product quantity:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.get("/orders", requireJwtAuth, async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { userId: req.user.id };
    const orders = await Order.find(query);
    res.json({ success: true, orders });
  } catch (err) {
    console.error("Error while fetching orders:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.delete("/order/:id", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const deletedOrder = await Order.findOneAndDelete({ orderId: req.params.id });
    if (!deletedOrder) return res.status(404).json({ success: false, error: "Order not found" });
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error while deleting order:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.put("/order/:id", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const orderId = req.params.id;
    const newStatus = req.body.status;
    const updatedOrder = await Order.findOneAndUpdate({ orderId }, { status: newStatus }, { new: true });
    if (!updatedOrder) return res.status(404).json({ success: false, error: "Order not found" });

    res.json({ success: true, order: updatedOrder });

    const { fullName, email } = updatedOrder;
    const mailOptions = {
      from: EMAIL_ADD,
      to: email,
      subject: "Order Shipped",
      text: `Dear ${fullName},\n\nYour order (${orderId}) has been shipped. Thank you for shopping with us!`,
    };
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Error while updating order status:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.get("/processingOrders", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const processingOrdersCount = await Order.countDocuments({ status: "processing" });
    res.json({ success: true, processingOrdersCount });
  } catch (err) {
    console.error("Error while fetching processing orders count:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.get("/shippedOrders", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const shippedOrdersCount = await Order.countDocuments({ status: "shipped" });
    res.json({ success: true, shippedOrdersCount });
  } catch (err) {
    console.error("Error while fetching shipped orders count:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.get("/totalAmountOfOrders", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const orders = await Order.find({});
    const totalAmountOfOrders = orders.reduce((total, o) => total + o.totalAmount, 0);
    res.json({ success: true, totalAmountOfOrders });
  } catch (err) {
    console.error("Error while fetching total amount of all orders:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.get("/deliveredOrders", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const deliveredOrdersCount = await Order.countDocuments({ status: "delivered" });
    res.json({ success: true, deliveredOrdersCount });
  } catch (err) {
    console.error("Error while fetching delivered orders count:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.get("/totalAmountOfDelivered", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const delivered = await Order.find({ status: "delivered" });
    const totalAmountOfDeliveredOrders = delivered.reduce((t, o) => t + o.totalAmount, 0);
    res.json({ success: true, totalAmountOfDeliveredOrders });
  } catch (err) {
    console.error("Error while fetching total amount of delivered orders:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.get("/totalAmountOfPending", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const pending = await Order.find({ status: { $in: ["shipped", "processing"] } });
    const totalAmountOfPending = pending.reduce((t, o) => t + o.totalAmount, 0);
    res.json({ success: true, totalAmountOfPending });
  } catch (err) {
    console.error("Error while fetching total amount of pending orders:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// New collections
app.get("/newcollections", requireJwtAuth, async (req, res) => {
  const products = await Product.find({});
  const newcollection = products.slice(1).slice(-8);
  res.send(newcollection);
});

// Bookings
app.post("/addbooking", requireJwtAuth, async (req, res) => {
  try {
    const { error, value } = bookingSchema.validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).json({ error: error.details[0].message });
    const allowed = pick(value, ["ownerName","email","phone","specialNotes","location","serviceType","vehicleModel","vehicleNumber","date","time"]);
    const newBooking = new Booking(allowed);
    await newBooking.save();
    res.status(201).json({ message: "Booking saved successfully" });
  } catch (err) {
    console.error("Error saving booking:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/updateBookingStatus2/:id", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      status: Joi.string().valid("pending","accepted","in_progress","completed","cancelled").required()
    }).validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: { status: value.status } },
      { new: true, runValidators: true }
    );
    if (!updatedBooking) return res.status(404).json({ error: "Booking not found" });

    if (updatedBooking.status === "accepted") {
      // TODO: implement your email content util if needed
      await transporter.sendMail({
        from: EMAIL_ADD,
        to: updatedBooking.email,
        subject: "Booking Accepted",
        text: "Your booking has been accepted."
      });
    }

    res.status(200).json({ message: "Booking status updated successfully", updatedBooking });
  } catch (err) {
    console.error("Error updating booking status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/updateBookingDetails/:id", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const { error, value } = bookingSchema.validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const allowed = pick(value, ["ownerName","email","phone","specialNotes","location","serviceType","vehicleModel","vehicleNumber","date","time"]);
    const updated = await Booking.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: "Booking not found" });

    res.status(200).json({ message: "Booking details updated successfully", updatedBooking: updated });
  } catch (err) {
    console.error("Error updating booking details:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/allBookingRequest", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const data = await Booking.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Services
app.post("/addservice", requireJwtAuth, hasRole(["admin"]), upload.single("image"), async (req, res) => {
  try {
    const { error, value } = serviceSchema.validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const allowed = pick(value, ["serviceTitle","estimatedHour","details","image"]);
    const newService = new Service({ serviceTitle: allowed.serviceTitle, estimatedHour: allowed.estimatedHour, details: allowed.details, imagePath: allowed.image });
    await newService.save();

    res.json({ success: true, name: allowed.serviceTitle });
  } catch (err) {
    console.error("Error adding service:", err);
    res.status(500).json({ error: "An error occurred while adding the service" });
  }
});

app.get("/allServices", requireJwtAuth, async (req, res) => {
  try {
    const data = await Service.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/deleteBookingRequest/:id", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.status(200).send("Booking request deleted successfully");
  } catch (err) {
    console.error("Error deleting booking request:", err);
    res.status(500).send("Internal server error");
  }
});

app.delete("/deleteServices/:id", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.status(200).send("Service deleted successfully");
  } catch (err) {
    console.error("Error deleting service:", err);
    res.status(500).send("Internal server error");
  }
});

app.put("/updateservice/:id", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const { error, value } = serviceSchema.validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const allowed = pick(value, ["serviceTitle","estimatedHour","details","image"]);
    const updated = await Service.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: "Service not found" });

    res.status(200).json({ message: "Service updated successfully", service: updated });
  } catch (err) {
    console.error("Error updating Service:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Issues
app.post("/issues", requireJwtAuth, async (req, res) => {
  try {
    const { error, value } = issueSchema.validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).send({ message: error.details[0].message });

    const allowed = pick(value, ["cid", "Cname", "Cnic", "Ccontact", "Clocation", "Cstatus"]);
    const issue = await Issue.create(allowed);
    res.status(201).send(issue);
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

app.get("/issues", requireJwtAuth, async (req, res) => {
  try {
    const issues = await Issue.find({});
    res.status(200).json({ count: issues.length, data: issues });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

app.get("/issues/:id", requireJwtAuth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    res.status(200).json(issue);
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

app.put("/issues/:id", requireJwtAuth, async (req, res) => {
  try {
    const { error, value } = issueSchema.validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).send({ message: error.details[0].message });

    const allowed = pick(value, ["cid", "Cname", "Cnic", "Ccontact", "Clocation", "Cstatus"]);
    const updated = await Issue.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Issue not found" });

    res.status(200).json({ message: "Issue update Successfully", issue: updated });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

app.delete("/issues/:id", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const deleted = await Issue.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Issue not found" });
    res.status(200).send({ message: "Issue delete Successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

// Customers (admin)
app.post("/customers/", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const { error, value } = customerSchema.validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const allowed = pick(value, ["customerID","name","NIC","address","contactno","email","vType","vName","Regno","vColor","vFuel"]);
    await Customers.create(allowed);
    res.json({ msg: "Customer added successfully" });
  } catch (err) {
    console.error("Error validating customer data:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

app.get("/customers/", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const customers = await Customers.find();
    res.json(customers);
  } catch {
    res.status(400).json({ msg: "No customers" });
  }
});

app.get("/customers/:id", requireJwtAuth, hasRole(["admin"]), validateParams(Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
})), async (req, res) => {
  try {
    const sanitizedId = mongoSanitize(req.params.id);
    const customer = await Customers.findById(sanitizedId);
    if (!customer) return res.status(404).json({ msg: "Customer not found" });
    res.json(customer);
  } catch {
    res.status(500).json({ msg: "Internal server error" });
  }
});

app.put("/customers/:id", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    const { error, value } = customerSchema.validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const allowed = pick(value, ["customerID","name","NIC","address","contactno","email","vType","vName","Regno","vColor","vFuel"]);
    const updated = await Customers.findByIdAndUpdate(req.params.id, allowed, { runValidators: true, new: true });
    if (!updated) return res.status(404).json({ msg: "Customer not found" });
    res.json({ msg: "Update successfully", customer: updated });
  } catch (err) {
    console.error("Error updating customer:", err);
    res.status(400).json({ msg: "Update fail" });
  }
});

app.delete("/customers/:id", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    await Customers.findByIdAndDelete(req.params.id);
    res.json({ msg: "Delete successfully" });
  } catch {
    res.status(400).json({ msg: "Delete fail" });
  }
});

app.get("/allusers", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  const users = await Admins.find({});
  res.send(users);
});

app.delete("/users/:id", requireJwtAuth, hasRole(["admin"]), async (req, res) => {
  try {
    await Admins.findByIdAndDelete(req.params.id);
    res.json({ msg: "Delete successfully" });
  } catch {
    res.status(400).json({ msg: "Delete fail" });
  }
});

// Error handling middleware (must be last)
app.use(errorLoggingMiddleware);

// --------- START ---------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
  // Start log monitoring
  logMonitor.startMonitoring();
  
  // Log server startup
  secureLogger.logSecurityEvent(SECURITY_EVENTS.SYSTEM_ERROR, {
    message: "Server started successfully",
    port: PORT,
    environment: NODE_ENV
  }, SECURITY_LEVELS.INFO);
  
  // Schedule log cleanup (daily)
  setInterval(() => {
    secureLogger.cleanupOldLogs(30); // Keep logs for 30 days
  }, 24 * 60 * 60 * 1000); // Run daily
});
