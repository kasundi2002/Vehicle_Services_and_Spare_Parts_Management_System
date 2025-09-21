import React from 'react'
import BNavBar from '../BookingNavBar/BNavBar'
import './AddBooking.css'
import BookingForm from '../BookingForm/BookingForm'


function AddBooking() {
  return (
    <div className='wrapContent-AddBooking'>
      <BNavBar/>
      <div className='form-cont'>
      <BookingForm/>
      </div>
    </div>
  )
}

export default AddBooking
