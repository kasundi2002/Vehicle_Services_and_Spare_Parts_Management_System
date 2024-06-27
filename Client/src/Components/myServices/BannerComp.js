import React from 'react'
import './BannerComp.css'
import serviceimg1 from '../../assets/Service/service banner1.png'

function BannerComp() {
  return (
    <div>
      <div className="banner1"></div>
        <div className="imgbnr">
          <img src={serviceimg1} alt="banner" />
        </div>   
    </div>
  )
}

export default BannerComp
