import React from 'react'
import Navbar from '../../components/onlineShop/Navbar/Navbar'
import ProductList from '../../components/onlineShop/ProductList/ProductList'
import './Online.css'

const OnlineShop = () => {
  return (
    <div className='OlineShop'>
      <ProductList/>
    </div>
  )
}

export default OnlineShop