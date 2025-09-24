const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
const crypto = require("crypto");

const AdminSchema = mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    role:{
        type: [String],  
    },
    // Authentication security fields
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    lastLogin: {
        type: Date
    },
    // MFA fields
    mfaSecret: {
        type: String
    },
    mfaEnabled: {
        type: Boolean,
        default: false
    },
    // Password reset fields
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    // Session management
    refreshTokens: [{
        token: String,
        createdAt: { type: Date, default: Date.now, expires: 604800 } // 7 days
    }],
    date:{
        type:Date,
        default:Date.now,
    }
});

// Virtual for account lockout
AdminSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
AdminSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
AdminSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Account lockout methods
AdminSchema.methods.incLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }
    
    return this.updateOne(updates);
};

AdminSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

// MFA methods
AdminSchema.methods.generateMfaSecret = function() {
    const secret = speakeasy.generateSecret({
        name: `Vehicle Services Admin (${this.email})`,
        issuer: 'Vehicle Services App'
    });
    
    this.mfaSecret = secret.base32;
    return secret;
};

AdminSchema.methods.verifyMfaToken = function(token) {
    return speakeasy.totp.verify({
        secret: this.mfaSecret,
        encoding: 'base32',
        token: token,
        window: 2 // Allow 2 time steps (60 seconds) of tolerance
    });
};

// Password reset methods
AdminSchema.methods.generatePasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

// Refresh token methods
AdminSchema.methods.generateRefreshToken = function() {
    const refreshToken = crypto.randomBytes(40).toString('hex');
    this.refreshTokens.push({ token: refreshToken });
    return refreshToken;
};

AdminSchema.methods.removeRefreshToken = function(token) {
    this.refreshTokens = this.refreshTokens.filter(t => t.token !== token);
};

module.exports = mongoose.model("Admins", AdminSchema);