import React from 'react'
import NavBar from '../NavBar/NavBar'
import ServiceForm from '../ServiceForm/ServiceForm'
import './AddService.css'

function AddService() {
  return (
    <div className='wrapContent-service'>
        <NavBar/>
        <div className='leftRight'>
        <ServiceForm/> 
        </div>
    </div>
  )
}

export default AddService
