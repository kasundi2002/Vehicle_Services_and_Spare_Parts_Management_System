import React, { useState } from 'react';
import './category.css';

const  category = ({ onCategoryChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setIsOpen(false);
    onCategoryChange(category);
  };

  const categories = [
    { value: '', label: 'All' },
    { value: 'Interiour', label: 'Interior' },
    { value: 'Exteriour', label: 'Exterior' },
    { value: 'Car_care', label: 'Car Care' }
  ];

  return (
    <div className="category-dropdown-container">
      <div className="category-dropdown-header" onClick={() => setIsOpen(!isOpen)}>
        {selectedCategory || 'All'}
        <span className={`category-dropdown-icon ${isOpen ? 'open' : ''}`}>&#9662;</span>
      </div>
      {isOpen && (
        <ul className="category-dropdown-menu">
          {categories.map((category, index) => (
            <li
              key={index}
              className="category-dropdown-option"
              onClick={() => handleCategoryChange(category.value)}
            >
              {category.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default category;

