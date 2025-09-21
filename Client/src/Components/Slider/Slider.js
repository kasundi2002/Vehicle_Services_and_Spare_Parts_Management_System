import React from 'react'
import 'react-slideshow-image/dist/styles.css'
import {Fade, Zoom, Slide} from 'react-slideshow-image'
import './Slider.css'
import HandymanIcon from '@mui/icons-material/Handyman';
import CarRepairIcon from '@mui/icons-material/CarRepair';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import EmergencyShareOutlinedIcon from '@mui/icons-material/EmergencyShareOutlined';
import { Link } from 'react-router-dom';


const slideImages = [
    {
      url: require('../../assets/slider1.jpg'),
      caption: {
        text: 'VEHICLE REPAIR',
        link: '/booking',
        additionalText: 'We care about your car'
      }
    },
    {
      url: require('../../assets/slider2.jpg'),
      caption: {
        text: 'VEHICLE SERVICING',
        link: '/booking',
        additionalText: 'We maintain your car well'
      }
    },
    {
      url: require('../../assets/slider3.jpg'),
      caption: {
        text: 'BUY SPARE PARTS',
        link: '/onlineshop',
        additionalText: 'Buy all products in one place'
      }
    },
    {
        url: require('../../assets/slider4.jpg'),
        caption: {
          text: '24HR EMERGENCIES',
          link: '/emergency',
          additionalText: 'We with you 24 hours'
        }
      },
  ];

  function Slider() {
    return (
      <div className="slide-container">
        <Fade>
          {slideImages.map((slideImage, index) => (
            <div className="each-slide" key={index}>
              <div className="image-container">
                <img src={slideImage.url} alt={slideImage.caption.text} />
                <div className='text'>
                <Link to={slideImage.caption.link}>
                  <span>{slideImage.caption.text}</span>
                </Link>
                <span className='aditional'>{slideImage.caption.additionalText}</span> {/* Display additional caption */}
                </div>
              </div>
            </div>
          ))}
        </Fade>
        <div className='service'>
            <div className='type'>
            <HandymanIcon/>
            <p>Vehicle Repair</p>
            </div>
            <div className='type'>
            <CarRepairIcon/>
            <p>Vehicle Servicing</p>
            </div>
            <div className='type'>
            <LocalMallOutlinedIcon/>
            <p>Buy Spare Parts</p>
            </div>
            <div className='type'>
            <EmergencyShareOutlinedIcon/>
            <p>24hr Emergencies</p>
            </div>
        </div>
      </div>
    );
  }
  
  

export default Slider