import React, { useContext } from 'react'
import logo from '../../assets/newlogo.png';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { Link } from 'react-router-dom';
import './Header.css'
import { ProductContext } from '../../Context/ProductContext';

function Header() {

const {getTotalCartItems} = useContext(ProductContext);

  return (
    <div className='Header'>
        <div className='leftHeader'>
        <img className='logo' src={logo} alt="logo" />
            <h1 className='pd'>P&D</h1>
            <h1 className="auto">Auto Engineers</h1>
        </div>
        <div className='rightHeader'>
          <div className='cart'>
          <Link to='/cart'><ShoppingCartOutlinedIcon style={{ color: 'white' }} fontSize="large"/></Link>
          <div className='cart-count'>
            {getTotalCartItems()}
          </div>
          </div>
          {localStorage.getItem('auth-token')
          ?<button className='login_btn' onClick={() =>{localStorage.removeItem('auth-token');window.location.replace('/')}}>Log Out</button>
          :<Link to='/loginSignup'>
          <button className='login_btn'>Log In</button>
          </Link>}
        </div>
    </div>
  )
}

export default Header