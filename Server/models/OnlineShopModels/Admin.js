const mongoose = require("mongoose");

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
    date:{
        type:Date,
        default:Date.now,
    }
});

module.exports = mongoose.model("Admins", AdminSchema);