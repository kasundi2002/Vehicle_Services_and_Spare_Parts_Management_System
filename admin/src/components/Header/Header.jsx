import React from 'react'
import logo from '../../assets/newlogo.png';
import { jwtDecode } from 'jwt-decode';
import './Header.css'

function Header() {

  const isAuthenticated = sessionStorage.getItem('authToken') !== null;
  let name;

  if(isAuthenticated){
    const token = sessionStorage.getItem('authToken');
    const decodedToken = jwtDecode(token);
    name = decodedToken.Admin.name;
  }

  return (
    <div className='Header'>
      <div className='leftHeader'>
        <img className='logo' src={logo} alt="logo" />
        <h1 className='pd'>P&D</h1>
        <h1 className="auto">Auto Engineers</h1>
      </div>
      <div className='rightHeader'>
        {sessionStorage.getItem('authToken') ? <h3 className='Hey'>Hey,</h3> : <></>}
        {sessionStorage.getItem('authToken') ? <h3 className='name'>{name}</h3> : <></>}
        {sessionStorage.getItem('authToken')
          ? <button className='login_btn' onClick={() => { sessionStorage.removeItem('authToken'); window.location.replace('/') }}>Log Out</button> : <></>}
      </div>
    </div>
  )
}

export default Header