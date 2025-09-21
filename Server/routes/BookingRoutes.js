const express = require('express');
const Booking = require("../models/BookingModel");

const router = express.Router();

//save post
router.post('/post/save',(req,res)=>{
    let newBooking = new Booking(req.body);

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

module,exports = router;