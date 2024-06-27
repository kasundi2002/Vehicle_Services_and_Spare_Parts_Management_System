import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import { NavbarData } from './NavbarData';

function Navbar() {
  const location = useLocation();

  return (
    <div className="Navbar">
      <ul className="NavbarList">
        {NavbarData.map((val, key) => (
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
  );
}

export default Navbar;
