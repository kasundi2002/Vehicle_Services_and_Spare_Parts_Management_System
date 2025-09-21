import React from 'react'
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';
import { NavBarData } from './NavBarData';

function NavBar() {
    const location = useLocation();
  return (
    
       <div className="NavBar">
      <ul className="NavBarList">
        {NavBarData.map((val, key) => (
          <li
            key={key}
            className='Row'
            id={location.pathname === val.link ? "active" : ""}
          >
            <Link to={val.link}>
              <div id="icons">{val.icon}</div>
              <div id="titles">{val.title}</div>
            </Link>
          </li>
        ))}
    </ul>
    </div>
  )
}

export default NavBar
