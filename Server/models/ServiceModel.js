// Import required libraries
const mongoose = require('mongoose');

// Define the schema
const serviceSchema = new mongoose.Schema({
    serviceTitle: {
        type: String,
        required: true
    },
    details: {
        type: String,
    }, 
    estimatedHour: {
        type: String,
        required: true
    },
    imagePath: { 
        type: String, 
        required: true 
    } // Image path field    
});

// Create the model
const Service = mongoose.model('Service', serviceSchema);
module.exports = Service; 