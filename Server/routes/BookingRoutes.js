const express = require('express');
const Booking = require("../models/BookingModel");

const router = express.Router();

// Allowlist body fields to prevent mass-assignment
function pick(obj, allowed = []) {
  const out = {};
  allowed.forEach(k => { if (obj[k] !== undefined) out[k] = obj[k]; });
  return out;
}

//save post
router.post('/post/save',(req,res)=>{
    // Block mass assignment - only allow specific booking fields
    const allowed = pick(req.body, ['ownerName', 'email', 'phone', 'specialNotes', 'location', 'serviceType', 'vehicleModel', 'vehicleNumber', 'date', 'time']);
    
    let newBooking = new Booking(allowed);

    newBooking.save((err)=>{
        if(err){
            return res.status(400).json({
                error:err
            });
        }
        return res.status(200).json({
            success:"Booking saved successfully"
        });
    });
})

module.exports = router;