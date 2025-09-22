const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { log } = require("console");
const Joi = require("joi");
require("dotenv").config();

const Product = require("./models/OnlineShopModels/Product");
const Users = require("./models/OnlineShopModels/Users");
const Order = require("./models/OnlineShopModels/Order");
const Admins = require("./models/OnlineShopModels/Admin");
var nodemailer = require('nodemailer');

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Validation Schemas
const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).max(128).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required()
});

const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required(),
  category: Joi.string().min(2).max(50).trim().required(),
  brand: Joi.string().min(2).max(50).trim().required(),
  image: Joi.string().uri().required(),
  new_price: Joi.number().positive().required(),
  old_price: Joi.number().positive().required(),
  description: Joi.string().max(500).trim().required(),
  quantity: Joi.number().integer().min(0).required()
});

const orderSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  address: Joi.string().min(10).max(200).trim().required(),
  contact: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(15).required(),
  paymentMethod: Joi.string().valid('cash', 'card', 'online').required(),
  items: Joi.array().items(Joi.object()).min(1).required(),
  totalAmount: Joi.number().positive().required()
});

const bookingSchema = Joi.object({
  ownerName: Joi.string().min(2).max(100).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(15).required(),
  specialNotes: Joi.string().max(500).trim().allow(''),
  location: Joi.string().min(5).max(100).trim().required(),
  serviceType: Joi.string().min(2).max(50).trim().required(),
  vehicleModel: Joi.string().min(2).max(50).trim().required(),
  vehicleNumber: Joi.string().min(2).max(20).trim().required(),
  date: Joi.date().min('now').required(),
  time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
});

const serviceSchema = Joi.object({
  serviceTitle: Joi.string().min(2).max(100).trim().required(),
  details: Joi.string().max(500).trim().allow(''),
  estimatedHour: Joi.string().min(1).max(20).trim().required(),
  image: Joi.string().uri().required()
});

const customerSchema = Joi.object({
  customerID: Joi.string().min(2).max(20).trim().required(),
  name: Joi.string().min(2).max(100).trim().required(),
  NIC: Joi.string().pattern(/^[0-9]{9}[vVxX]|[0-9]{12}$/).required(),
  address: Joi.string().min(10).max(200).trim().required(),
  contactno: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(15).required(),
  email: Joi.string().email().lowercase().trim().required(),
  vType: Joi.string().min(2).max(20).trim().required(),
  vName: Joi.string().min(2).max(50).trim().required(),
  Regno: Joi.string().min(2).max(20).trim().required(),
  vColor: Joi.string().min(2).max(20).trim().required(),
  vFuel: Joi.string().min(2).max(20).trim().required()
});

const issueSchema = Joi.object({
  cid: Joi.string().min(2).max(20).trim().required(),
  Cname: Joi.string().min(2).max(100).trim().required(),
  Cnic: Joi.string().pattern(/^[0-9]{9}[vVxX]|[0-9]{12}$/).required(),
  Ccontact: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(15).required(),
  Clocation: Joi.string().min(5).max(100).trim().required(),
  Cstatus: Joi.string().valid('pending', 'in_progress', 'resolved', 'closed').required()
});

const inventorySchema = Joi.object({
  InventoryType: Joi.string().min(2).max(50).trim().required(),
  InventoryName: Joi.string().min(2).max(100).trim().required(),
  Vendor: Joi.string().min(2).max(50).trim().required(),
  UnitPrice: Joi.number().positive().required(),
  UnitNo: Joi.number().integer().min(0).required(),
  Description: Joi.string().max(500).trim().required()
});

// CORS configuration with proper environment variable handling
const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : 
  ['http://localhost:3000', 'http://localhost:3001'];

const corsOptions = {
  origin: function (origin, cb) {
    // allow same-origin / mobile apps (no Origin header)
    if (!origin) return cb(null, true);
    return allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error('CORS blocked'), false);
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','auth-token'],
  credentials: true
};

app.use(express.json({ limit: '10mb' }));
app.use(cors(corsOptions));

// Passport Configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await Users.findOne({ googleId: profile.id });
    
    if (user) {
      return done(null, user);
    }
    
    // Check if user exists with same email
    user = await Users.findOne({ email: profile.emails[0].value });
    if (user) {
      user.googleId = profile.id;
      await user.save();
      return done(null, user);
    }
    
    // Create new user
    user = new Users({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      password: '', // No password for OAuth users
      cartData: {}
    });
    
    await user.save();
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await Users.findById(payload.user.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

app.use(passport.initialize());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/vehicle_services";
mongoose.connect(mongoURI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB Connection Error:", err));

// Image Storage Engine with enhanced security
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    return cb(null, `${file.fieldname}_${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 2 * 1024 * 1024, // 2MB limit
    files: 1 // Only one file at a time
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    const allowedExts = ['.jpg', '.jpeg', '.png'];
    
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG and PNG images are allowed.'), false);
    }
    
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExts.includes(ext)) {
      return cb(new Error('Invalid file extension. Only .jpg, .jpeg, and .png files are allowed.'), false);
    }
    
    cb(null, true);
  }
});

// Creating upload endpoint for images
app.use('/images', express.static('upload/images'));

app.post("/upload", upload.single('product'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, error: 'No file uploaded' });
  }
  
  res.json({
    success: 1,
    image_url: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
});

// OAuth Routes
app.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const data = {
        user: {
          id: req.user._id
        }
      };
      const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '24h' });
      
      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

// Secure Authentication Routes
app.post('/signup', async (req, res) => {
  try {
    // Validate input
    const { error, value } = userSchema.validate(req.body, { allowUnknown: false });
    if (error) {
      return res.status(400).json({ success: false, errors: error.details[0].message });
    }

    let check = await Users.findOne({ email: value.email });
    if (check) {
      return res.status(400).json({ success: false, errors: "existing user found with same email address" });
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(value.password, saltRounds);
    
    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }
    
    const user = new Users({
      name: value.name,
      email: value.email,
      password: hashedPassword,
      cartData: cart,
    });

    await user.save();

    const data = {
      user: {
        id: user.id
      }
    };

    const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
});

app.post('/login', authLimiter, async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body, { allowUnknown: false });
    if (error) {
      return res.status(400).json({ success: false, errors: error.details[0].message });
    }

    let user = await Users.findOne({ email: value.email });
    if (user) {
      const passCompare = await bcrypt.compare(value.password, user.password);
      if (passCompare) {
        const data = {
          user: {
            id: user.id
          }
        };
        const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ success: true, token });
      } else {
        res.status(401).json({ success: false, errors: "Invalid credentials" });
      }
    } else {
      res.status(401).json({ success: false, errors: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
});

// Secure JWT Middleware
const fetchUser = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).json({ errors: "please authenticate using valid token" });
  }
  
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).json({ errors: "please authenticate using valid token" });
  }
};

// Protected Routes
app.post('/addtocart', fetchUser, async (req, res) => {
  try {
    const itemId = Number(req.body.itemId);
    if (isNaN(itemId)) {
      return res.status(400).json({ success: false, error: 'Invalid item ID' });
    }

    const product = await Product.findOne({ id: itemId });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    if (product.quantity <= 0) {
      return res.status(400).json({ success: false, error: 'Product out of stock' });
    }

    product.quantity -= 1;
    await product.save();

    let userData = await Users.findOne({ _id: req.user.id });
    userData.cartData[itemId] += 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    
    res.json({ success: true, message: "Item added to cart successfully" });
  } catch (error) {
    console.error("Error while adding item to cart:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Add other secure routes here...

const port = process.env.PORT || 5000;

app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on Port " + port);
  } else {
    console.log("Error : " + error);
  }
});

module.exports = app;
