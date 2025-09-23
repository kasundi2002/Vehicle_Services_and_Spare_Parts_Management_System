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
app.use(express.json());

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
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// --------- MODELS ---------
const Product = require("./models/OnlineShopModels/Product");
const Users = require("./models/OnlineShopModels/Users");
const Order = require("./models/OnlineShopModels/Order");
const Admins = require("./models/OnlineShopModels/Admin");
const Customers = require("./models/customerModel");
const Booking = require("./models/BookingModel");
const Service = require("./models/ServiceModel");
const Issue = require("./models/issueModel");

// --------- VALIDATION SCHEMAS ---------
const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).max(128).required()
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
  paymentMethod: Joi.string().valid("cash", "card", "online").required(),
  items: Joi.array().items(Joi.object()).min(1).required(),
  totalAmount: Joi.number().positive().required()
});

const bookingSchema = Joi.object({
  ownerName: Joi.string().min(2).max(100).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(15).required(),
  specialNotes: Joi.string().max(500).trim().allow(""),
  location: Joi.string().min(5).max(100).trim().required(),
  serviceType: Joi.string().min(2).max(50).trim().required(),
  vehicleModel: Joi.string().min(2).max(50).trim().required(),
  vehicleNumber: Joi.string().min(2).max(20).trim().required(),
  date: Joi.date().min("now").required(),
  time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
});

const serviceSchema = Joi.object({
  serviceTitle: Joi.string().min(2).max(100).trim().required(),
  details: Joi.string().max(500).trim().allow(""),
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
  Cstatus: Joi.string().valid("pending", "in_progress", "resolved", "closed").required()
});

// --------- HELPERS ---------
function pick(obj, allowed = []) {
  const out = {};
  allowed.forEach(k => { if (obj[k] !== undefined) out[k] = obj[k]; });
  return out;
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
    const payload = jwt.verify(token, JWT_SECRET);
    const u = payload?.user || payload?.User || payload?.Admin || payload?.admin || payload;
    if (!u) return res.status(401).json({ message: "Invalid token" });
    req.user = {
      id: u._id || u.id,
      email: u.email,
      name: u.name,
      role: Array.isArray(u.role) ? u.role[0] : u.role || (u.isAdmin ? "admin" : "user") || "user",
    };
    next();
  } catch (e) {
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

// --------- UPLOADS ---------
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png"];
    const allowedExts = [".jpg", ".jpeg", ".png"];
    if (!allowedMimes.includes(file.mimetype)) return cb(new Error("Invalid file type"), false);
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExts.includes(ext)) return cb(new Error("Invalid file extension"), false);
    cb(null, true);
  }
});
app.use("/images", express.static("upload/images"));

app.post("/upload", upload.single("product"), (req, res) => {
  const proto = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.get("host");
  res.json({ success: 1, image_url: `${proto}://${host}/images/${req.file.filename}` });
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
app.post("/addproduct", async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    const products = await Product.find({});
    let id = products.length ? products[products.length - 1].id + 1 : 1;

    const product = new Product({ id, ...value });
    await product.save();

    res.json({ success: true, name: value.name });
  } catch (err) {
    console.error("Error while adding product:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.post("/removeproduct", async (req, res) => {
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

app.get("/allproducts", async (req, res) => {
  const products = await Product.find({});
  res.send(products);
});

app.put("/updateproduct/:id", async (req, res) => {
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

app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
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
app.post("/signup", async (req, res) => {
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

app.post("/login", async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).json({ success: false, errors: error.details[0].message });

    const user = await Users.findOne({ email: value.email });
    if (!user || value.password !== user.password) return res.json({ success: false, errors: "Invalid credentials" });

    const token = jwt.sign({ user: { id: user.id, email: user.email, name: user.name, role: "user" } }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ success: true, token });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
});

app.post("/adminlogin", async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).json({ success: false, errors: error.details[0].message });

    const admin = await Admins.findOne({ email: value.email });
    if (!admin || value.password !== admin.password) return res.json({ success: false, errors: "Invalid credentials" });

    const token = jwt.sign({ user: { id: admin._id, email: admin.email, name: admin.name, role: "admin" } }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ success: true, token });
  } catch (err) {
    console.error("Error during admin login:", err);
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

app.get("/product/quantity/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
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

app.put("/order/:id", async (req, res) => {
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

app.put("/updateBookingStatus2/:id", async (req, res) => {
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

app.get("/allServices", async (req, res) => {
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

app.get("/customers/:id", requireJwtAuth, async (req, res) => {
  try {
    const customer = await Customers.findById(req.params.id);
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

// --------- START ---------
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
