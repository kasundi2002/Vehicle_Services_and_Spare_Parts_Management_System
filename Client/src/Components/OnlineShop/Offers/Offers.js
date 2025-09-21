import React from 'react'
import './Offers.css'
import img_2 from '../../../assets/img_2.png'

const Offers = () => {
  return (
    <div className='offers'>
        <div className='offers-left'>
            <h1>Weekly Offer For You</h1>
            <p>GRAB YOURS BEFORE END</p>
            <button>Buy Now</button>
        </div>
        <div className='offers-rigth'>
            <img className="offer_image" src={img_2} alt="" />
        </div>
    </div>
  )
}

export default Offers