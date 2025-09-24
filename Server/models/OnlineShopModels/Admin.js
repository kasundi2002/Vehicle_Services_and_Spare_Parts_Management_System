const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
    // Account security fields
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
    isLocked: {
        type: Boolean,
        default: false
    },
    // MFA fields
    mfaSecret: {
        type: String
    },
    mfaEnabled: {
        type: Boolean,
        default: false
    },
    // Password reset
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    date:{
        type:Date,
        default:Date.now,
    }
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
AdminSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

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
        $unset: { loginAttempts: 1, lockUntil: 1 },
        $set: { lastLogin: new Date() }
    });
};

// MFA methods
AdminSchema.methods.generateMfaSecret = function() {
    const secret = speakeasy.generateSecret({
        name: `Vehicle Services Admin (${this.email})`,
        length: 32
    });
    this.mfaSecret = secret.base32;
    return secret;
};

AdminSchema.methods.verifyMfaToken = function(token) {
    return speakeasy.totp.verify({
        secret: this.mfaSecret,
        encoding: 'base32',
        token: token,
        window: 2
    });
};

// Password reset methods
AdminSchema.methods.generatePasswordResetToken = function() {
    const resetToken = uuidv4();
    this.resetPasswordToken = resetToken;
    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

module.exports = mongoose.model("Admins", AdminSchema);