import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./nav.css";

const NavBar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <ul className="navbar-nav">
        <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <Link to="/" className="nav-link">
            HOME
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/service" className="nav-link">
            SERVICES
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/promotion" className="nav-link">
            PROMOTIONS
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/contact" className="nav-link">
            CONTACT US
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/about" className="nav-link">
            ABOUT US
          </Link>
        </li>
        <li className="nav-item" id="book">
          <Link to="/booking" className="nav-link">
            BOOK NOW
          </Link>
        </li>
        {/*<li className="nav-item" id="book">
          <Link to="/inventory" className="nav-link">
            VIEW INVENTORY
          </Link>
  </li>*/}
        <li className="nav-item" id="shop">
          <Link to="/onlineShop" className="nav-link">
            SHOP NOW
          </Link>
        </li>
        <li className="nav-item" id="emergency">
          <Link to="/emergency" className="nav-link">
            EMERGENCY
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
