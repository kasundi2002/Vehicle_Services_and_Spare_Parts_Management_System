import React from 'react'
import { Link, useLocation } from 'react-router-dom';
import './BNavBar.css';
import { BNavData } from './BnavData';

function BNavBar() {
    const location = useLocation();
  return (
    
       <div className="BNavBar">
      <ul className="BNavBarList">
        {BNavData.map((val, key) => (
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

export default BNavBar
