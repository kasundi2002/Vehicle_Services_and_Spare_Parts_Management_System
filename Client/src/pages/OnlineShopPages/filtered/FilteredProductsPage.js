import React, { useEffect, useState } from 'react';
import './FilteredProductsPage.css';
import Item from '../../../Components/OnlineShop/item/item';
import { useLocation } from 'react-router-dom';

const FilteredProductsPage = () => {
  const location = useLocation();
  const searchTerm = location.state?.searchTerm || '';

  const [all_product,setAll_product] = useState([]);

    useEffect(()=>{
        fetch('http://localhost:4000/allproducts')
        .then((response)=>response.json())
        .then((data)=>setAll_product(data))
     },[])

  const filteredProducts = all_product.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='Filter_products'>
      <h2>Search Results for "{searchTerm}"</h2>
      {filteredProducts.length > 0 ? (
        <div className="product-list">
          {filteredProducts.map(product => (
            <Item
              id={product.id}
              name={product.name}
              image={product.image}
              new_price={product.new_price}
              old_price={product.old_price}
            />
          ))}
        </div>
      ) : (
        <p>No matching products found.</p>
      )}
    </div>
  );
};

export default FilteredProductsPage;



