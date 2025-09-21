import React from 'react'
import './AddButton.css'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { Link } from 'react-router-dom';

const AddButton = () => {
  return (
    <div>
        <Link to="/onlineshop/products/addproduct">
            <button className='addbtn'>
                Add Product
                <AddOutlinedIcon/>
            </button>
        </Link>
    </div>
  )
}

export default AddButton