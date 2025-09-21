import React from 'react'
import './Breadcrum.css'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const Breadcrum = (props) => {
    const {product} = props;
  return (
    <div className='breadcrum'>
        HOME <ArrowForwardIosIcon/> Product <ArrowForwardIosIcon/> {product.category} <ArrowForwardIosIcon/> {product.name}
    </div>
  )
}

export default Breadcrum