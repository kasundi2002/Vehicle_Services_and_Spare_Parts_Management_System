import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { SidebarDatatop } from './SidebarDatatop';
import { SidebarDatabottom } from './SidebarDatabottom';

function Sidebar() {
  const location = useLocation();

  return (
    <div className="Sidebar">
      <ul className="SidebarList">
        {SidebarDatatop.map((val, key) => (
          <li
            key={key}
            className='Row'
            id={location.pathname.startsWith(val.link) ? "active" : ""}
          >
            <Link to={val.link}>
              <div id="icon">{val.icon}</div>
              <div id="title">{val.title}</div>
            </Link>
          </li>
        ))}
      </ul>
      <h2 className='System'>------Systems------</h2>
      <ul className="SidebarList">
        {SidebarDatabottom.map((val, key) => (
          <li
            key={key}
            className='Row'
            id={location.pathname.startsWith(val.link) ? "active" : ""}
          >
            <Link to={val.link}>
              <div id="icon">{val.icon}</div>
              <div id="title">{val.title}</div>
            </Link>
          </li>
        ))}
      </ul>  
    </div>
  );
}

export default Sidebar;
