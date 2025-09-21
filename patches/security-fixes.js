// Security Fixes for Vehicle Services and Spare Parts Management System
// Apply these fixes to Server/index.js

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const expressValidator = require('express-validator');
const csrf = require('csurf');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

// Security Headers
app.use(helmet());
app.use(helmet.hsts({ maxAge: 31536000 }));

// HTTPS Enforcement
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
        next();
    }
});

// CORS Configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));

// Rate Limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: 'Too many login attempts, please try again later.'
});

app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CSRF Protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Database Connection - SECURE VERSION
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle-services', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// File Upload Security
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        // Generate secure filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return cb(null, `${file.fieldname}_${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    const isValidMimeType = allowedTypes.includes(file.mimetype);
    const isValidExtension = allowedExtensions.includes(path.extname(file.originalname).toLowerCase());
    
    if (isValidMimeType && isValidExtension) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1
    }
});

// Serve static files
app.use('/images', express.static('upload/images'));

// Input Validation Middleware
const { body, validationResult } = expressValidator;

// Secure JWT Helper
const generateToken = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET || 'fallback-secret-change-in-production', {
        expiresIn: '24h'
    });
};

// Secure User Registration
app.post('/signup', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
    body('name').trim().escape().isLength({ min: 2, max: 50 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { name, email, password } = req.body;

        let check = await Users.findOne({ email: email });
        if (check) {
            return res.status(400).json({
                success: false,
                errors: "User with this email already exists"
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        let cart = {};
        for (let i = 0; i < 300; i++) {
            cart[i] = 0;
        }

        const user = new Users({
            name: name,
            email: email,
            password: hashedPassword,
            cartData: cart,
        });

        await user.save();

        const data = {
            user: {
                id: user.id
            }
        };

        const token = generateToken(data);
        res.json({ success: true, token });
    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({ 
            success: false, 
            error: "Internal server error" 
        });
    }
});

// Secure Login
app.post('/login', loginLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { email, password } = req.body;
        let user = await Users.findOne({ email: email });
        
        if (user) {
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (isValidPassword) {
                const data = {
                    user: {
                        id: user.id
                    }
                };
                const token = generateToken(data);
                res.json({ success: true, token });
            } else {
                res.json({ success: false, errors: "Invalid credentials" });
            }
        } else {
            res.json({ success: false, errors: "Invalid credentials" });
        }
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({ 
            success: false, 
            error: "Internal server error" 
        });
    }
});

// Secure File Upload
app.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: 0,
            error: "No file uploaded or invalid file type"
        });
    }

    res.json({
        success: 1,
        image_url: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ error: 'Unexpected file field' });
        }
    }
    
    res.status(500).json({ error: 'Internal server error' });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on Port " + port);
    } else {
        console.log("Error: " + error);
    }
});

// Export for testing
module.exports = app;





