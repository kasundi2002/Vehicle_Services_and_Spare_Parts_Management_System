const mongoose = require('mongoose');

// Function to generate a unique order ID
function generateBookingId() {
  // Generate a random number for the numerical part of the ID
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit number
  
  // Concatenate 'B' with the random number to form the booking ID
  const BookingId = 'B' + randomNumber.toString();
  
  return BookingId;
}


const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, 
    default: generateBookingId 
  }, // Set default value to the function generateBookingId 
  ownerName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  specialNotes: { 
    type: String 
  },
  status: { 
    type: String, 
    default: 'pending' // Set default value to 'pending'
  }, 
  mechanic: { 
    type: String },
  location: { type: String, 
    required: true 
  },
  serviceType: { 
    type: String, 
    required: true 
  },
  vehicleModel: { 
    type: String, 
    required: true 
  },
  vehicleNumber: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
