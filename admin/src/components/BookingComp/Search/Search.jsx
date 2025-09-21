import React from 'react';
import './Search.css';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
  
const Search = ({ handleSearch }) => {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search..."
        onChange={(e) => handleSearch(e.target.value)}
      />
     
    </div>
  );
};

export default Search;
