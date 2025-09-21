import React, { useState } from 'react';
import "./Filter.css"

const Filter = ({ allProducts, onFilterChange }) => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');

    const handleCategoryChange = (event) => {
        const category = event.target.value;
        setSelectedCategory(category);
        onFilterChange(category, selectedBrand);
    };

    const handleBrandChange = (event) => {
        const brand = event.target.value;
        setSelectedBrand(brand);
        onFilterChange(selectedCategory, brand);
    };

    // Get unique categories and brands from all products
    const uniqueCategories = [...new Set(allProducts.map(product => product.category))];
    const uniqueBrands = [...new Set(allProducts.map(product => product.brand))];

    return (
        <div className='filter-container'>
            <div className='category-container'>
                <span>Filter by Category:</span>
                <div className='category-option'>
                  <label>
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={selectedCategory === ''}
                      onChange={handleCategoryChange}
                    />
                      All
                  </label>
                  {uniqueCategories.map((category, index) => (
                      <label key={index}>
                          <input
                              type="radio"
                              name="category"
                              value={category}
                              checked={selectedCategory === category}
                              onChange={handleCategoryChange}
                          />
                          {category}
                      </label>
                  ))}
                </div>
            </div>
            <div className='brand-container'>
                <span>Filter by Brand:</span>
                <div className='brand-option'>
                  <label>
                    <input
                      type="radio"
                      name="brand"
                      value=""
                      checked={selectedBrand === ''}
                      onChange={handleBrandChange}
                    />
                    All
                  </label>
                  {uniqueBrands.map((brand, index) => (
                      <label key={index}>
                          <input
                              type="radio"
                              name="brand"
                              value={brand}
                              checked={selectedBrand === brand}
                              onChange={handleBrandChange}
                          />
                          {brand}
                      </label>
                  ))}
                </div>
            </div>
        </div>
    );
};

export default Filter;
