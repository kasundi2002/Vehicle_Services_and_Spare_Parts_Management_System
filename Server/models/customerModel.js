const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    customerID:{
        type:String,
        require:true,
    },
    name:{
        type:String,
    },
    NIC:{
        type:String,
    },
    address:{
        type:String,
    },
    contactno:{
        type:String,
    },
    email:{
        type:String,
    },

    vType:{
        type:String,
    },

    vName:{
        type:String,
    },

    Regno:{
        type:String,
    },

    vColor:{
        type:String,
    },

    vFuel:{
        type:String,
    }
});

module.exports = Customer = mongoose.model("customer", CustomerSchema);