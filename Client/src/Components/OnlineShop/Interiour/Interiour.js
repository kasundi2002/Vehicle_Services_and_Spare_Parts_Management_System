import React, { useEffect, useState } from 'react';
import './Interiour.css';
import Item from '../item/item';
import { Link } from 'react-router-dom';

const Interiour = () => {

    const [all_product,setAll_product] = useState([]);

    useEffect(()=>{
        fetch('https://vehicle-sever.onrender.com/allproducts')
        .then((response)=>response.json())
        .then((data)=>setAll_product(data))
     },[])

    const CarCareProducts = all_product.filter(product => product.category === 'Interiour');
    const firstFourItems = CarCareProducts.slice(0, 4);
    

    return (
        <div>
        <div className='heading'>
            <h1 className='Interiour-title'>INTERIOUR PRODUCTS</h1>
            < Link to='/interiour' className='link'>
                view more
            </Link>
        </div>
        <div className='Interiour'>
            <hr />
            <div className='Interiour-item'>
            {firstFourItems.map((item, i) => {
                return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />;
            })}
            </div>
        </div>
        </div>
    );
};

export default Interiour;