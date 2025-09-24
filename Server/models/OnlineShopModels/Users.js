const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UsersSchema = mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    googleId:{
        type:String,
        unique:true,
        sparse:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,   
    },
    date:{
        type:Date,
        default:Date.now,
    }
});

// Hash password before saving
UsersSchema.pre('save', async function(next) {
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
UsersSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Users", UsersSchema);
