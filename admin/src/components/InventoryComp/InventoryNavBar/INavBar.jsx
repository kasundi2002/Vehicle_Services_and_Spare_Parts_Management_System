import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './INavBar.css';  
import { INavData } from './INavData';  

function InventoryNavBar() {
    const location = useLocation();
    
    return (
        <div className="INav">  
            <ul className="INavList">  
                {INavData.map((val, key) => (
                    <li
                        key={key}
                        className='row'
                        id={location.pathname === val.link ? "active" : ""}
                    >
                        <Link to={val.link}>
                            <div className="INavListIcons">{val.icon}</div>
                            <div className="INavListTitles">{val.title}</div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default InventoryNavBar;
