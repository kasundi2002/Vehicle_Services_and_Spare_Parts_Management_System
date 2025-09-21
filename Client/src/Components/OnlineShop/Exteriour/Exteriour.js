import React, { useEffect, useState } from 'react';
import './Exteriour.css';
import Item from '../item/item';
import { Link } from 'react-router-dom';

const Exteriour = () => {

    const [all_product,setAll_product] = useState([]);

    useEffect(()=>{
        fetch('https://vehicle-sever.onrender.com/allproducts')
        .then((response)=>response.json())
        .then((data)=>setAll_product(data))
     },[])

    const ExteriourProducts = all_product.filter(product => product.category === 'Exteriour');
    const firstFourItems = ExteriourProducts.slice(0, 4);
    

    return (
        <div>
        <div className='heading'>
            <h1 className='Exteriour-title'>EXTERIOUR PRODUCTS</h1>
            < Link to='/Exteriour' className='link'>
                view more
            </Link>
        </div>
        <div className='Exteriour'>
            <hr />
            <div className='Exteriour-item'>
            {firstFourItems.map((item, i) => {
                return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />;
            })}
            </div>
        </div>
        </div>
    );
};

export default Exteriour;