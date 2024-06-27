import React from 'react'
import './OnlineShop.css'
import Popular from '../../../Components/OnlineShop/popular/popular'
import Banner from '../../../assets/img_3.jpg'
import Offers from '../../../Components/OnlineShop/Offers/Offers'
import ProductSearch from '../../../Components/OnlineShop/ProductSearch/ProductSearch'
import CarCare from '../../../Components/OnlineShop/CarCare/CarCare'
import Interiour from '../../../Components/OnlineShop/Interiour/Interiour'
import Exteriour from '../../../Components/OnlineShop/Exteriour/Exteriour'
import DropDownMenu from '../../../Components/OnlineShop/DropdownMenu/DropDownMenu'
import PopupSort from '../../../Components/Sort/PopupSort'

const OnlineShop = () => {
  return (
    <div className='OnlineShop'>
        <img className='banner' src={Banner} alt="logo" />
        <div className='filter'>
          <DropDownMenu/>
          <ProductSearch/>
          <PopupSort/>
        </div>
        <Popular/>
        <Offers/>
        <Interiour />
        <Exteriour />
        <CarCare />
    </div>
  )
}

export default OnlineShop;