import React, { useState } from 'react';
import './OrderCategory.css';

const OrderCategory = ({ onCategoryChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setIsOpen(false);
    onCategoryChange(category);
  };

  const categories = [
    { value: '', label: 'All' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' }
  ];

  return (
    <div className="ordercategory-dropdown-container">
      <div className="ordercategory-dropdown-header" onClick={() => setIsOpen(!isOpen)}>
        {selectedCategory || 'All'}
        <span className={`ordercategory-dropdown-icon ${isOpen ? 'open' : ''}`}>&#9662;</span>
      </div>
      {isOpen && (
        <ul className="ordercategory-dropdown-menu">
          {categories.map((category, index) => (
            <li
              key={index}
              className="ordercategory-dropdown-option"
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

export default OrderCategory;
