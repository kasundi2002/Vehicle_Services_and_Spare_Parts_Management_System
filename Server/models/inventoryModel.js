const mongoose = require('mongoose');

 
const CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

 
const Counter = mongoose.model('Counter', CounterSchema);

 
const InventorySchema = new mongoose.Schema({
    InventoryID: {
        type: Number,
        unique: true  
    },
    InventoryType: {
        type: String,
        required: true,
    },
    InventoryName: {
        type: String,
        required: true,
    },
    Vendor: {
        type: String,
        required: true,
    },
    UnitPrice: {
        type: Number,
        required: true,
    },
    UnitNo: {
        type: Number,
        required: true,
    },
    Description: {
        type: String,
        required: true,
    },
});

 
InventorySchema.pre('save', function(next) {
    const doc = this;
    Counter.findByIdAndUpdate(
        { _id: 'inventoryId' },  
        { $inc: { seq: 1 } },  
        { new: true, upsert: true }  
    )
    .then(counter => {
        doc.InventoryID = counter.seq;
        next();
    })
    .catch(error => {
        console.error('Error during InventoryID generation:', error);
        next(error);
    });
});

// Create the Inventory model
const Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = Inventory;
