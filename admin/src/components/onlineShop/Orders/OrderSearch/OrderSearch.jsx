import React, { useState } from 'react';
import './OrderSearch.css';

const OrderSearch = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearch = () => {
        onSearch(searchTerm);
    };

    return (
        <div className='searchbar'>
            <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Search by full name, contact, or email" />
            <button onClick={handleSearch}>Search</button>
        </div>
    );
};

export default OrderSearch;
