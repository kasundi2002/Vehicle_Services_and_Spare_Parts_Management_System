import React from 'react';
import './Inventory.css';
import InventoryNavBar from '../../components/InventoryComp/InventoryNavBar/INavBar';
 

function InventoryRequest() {
    return (
        <div className='inventory-request-container'> {/* Ensure class name matches the CSS */}
            <InventoryNavBar /> {/* Correct the component name */}
            {/* Add your InventoryRequestTable component here */}
        </div>
    );
}

export default InventoryRequest;
 