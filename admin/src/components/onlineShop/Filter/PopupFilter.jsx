import React, { useState } from 'react';
import Filter from './Filter';
import './PopupFilter.css'

const FilterProduct = ({ allProducts, onFilterChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleFilter = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div>
            <button className='popup-btn' onClick={toggleFilter}>Filter</button>
            {isOpen && <Filter allProducts={allProducts} onFilterChange={onFilterChange} />}
        </div>
    );
};

export default FilterProduct;
