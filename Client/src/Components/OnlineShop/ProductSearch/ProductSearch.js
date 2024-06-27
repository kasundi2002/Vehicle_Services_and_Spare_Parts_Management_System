import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductSearch.css';

const ProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      navigate('/search-results', { state: { searchTerm } });
    } else {
      alert('Cannot search with an empty field');
    }
  };

  return (
    <div className='searchbar'>
      <input
        type="text"
        className='search'
        placeholder="Search your product"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default ProductSearch;





