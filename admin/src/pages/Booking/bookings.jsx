import React from 'react'
import RequestTable from '../../components/BookingComp/BRequestTable/RequestTable'
import './Bookings.css'
import BNavBar from '../../components/BookingComp//BookingNavBar/BNavBar'


function BookingRequest() {
  
  return (
    <div className='wrapContent-booking'>
      <BNavBar />
      <RequestTable />
    </div>
  )
}

export default BookingRequest
