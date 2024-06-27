import React from 'react'
import './Footer.css'
import logo1 from '../../assets/newlogo.png'
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CallIcon from '@mui/icons-material/Call';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import FaxIcon from '@mui/icons-material/Fax';
import EmailIcon from '@mui/icons-material/Email';
import facebook from '../../assets/facebook.png'
import instagram from '../../assets/instagram.png'
import whatsapp from '../../assets/whatsapp.png'


function Footer() {
  return (
    <div>
        <div className='footer'>
          <div className='footerContainer'>
          <div className='containers'>
            <div className='container3'>
                <img className='logo1'src={logo1} />
                <h2 className='pd1'>P&D Auto Engineers (Pvt.) Ltd.</h2>
                <img className='social' src={facebook} />
                <img className='social' src={instagram} />
                <img className='social' src={whatsapp} />
            </div>

            <div className='container3'>
                <h2>About us</h2>
                <p>Our company is a leading manufacturer of automotive parts in Pakistan. We are known for our quality products and services. We have been in the industry for over 20 years and have a strong reputation for our quality products and services.</p>
            </div>  
            <div className='container3'>
                <h2>Contact us</h2>
                <p ><LocationOnIcon/> 417/1 nine-canel road, Wijayapura,<br/>  Anuradhapura</p>
                <p><PhoneIphoneIcon/> +9477 527 5275</p>
                <p><CallIcon/> +9411 234 4356</p>
                <p><FaxIcon/> +9411 342 9000</p>
                <p><EmailIcon/> info@p&dauto.lk</p>
            </div>  
         </div>
        </div>
      </div>
    </div>
  )
}

export default Footer
