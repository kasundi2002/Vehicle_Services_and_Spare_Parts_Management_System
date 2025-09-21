import React from 'react'
import BNavBar from '../BookingNavBar/BNavBar'
import './Dashboard.css'
import DBoardCont from './DBoardCont/DBoardCont'

function Dashboard() {
  return (
    <div className='wrapContent-dashboard'>
        <BNavBar />

        <div className='dashboard'>
            <DBoardCont/>
            </div>

      
    </div>
  )
}

export default Dashboard
