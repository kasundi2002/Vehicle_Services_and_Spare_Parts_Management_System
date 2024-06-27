import React from 'react'
import Category from "../category/category"
import Filter from "../Filter/PopupFilter"
import Search from '../Search/Search'
import AddButton from '../AddButon/AddButton'
import './ProductOptions.css'

const ProductOptions = () => {
  return (
    <div className='options'>
        <div className='optinos-left'>
            <Category/>
        </div>
        <div className='options-right'>
            <Filter/>
            <Search/>
            <AddButton/>
        </div> 
    </div>
  )
}

export default ProductOptions