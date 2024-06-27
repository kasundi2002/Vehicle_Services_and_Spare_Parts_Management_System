import React, { useEffect, useState } from 'react';
import './CarCare.css';
import Item from '../item/item';
import { Link } from 'react-router-dom';

const CarCare = () => {

    const [all_product,setAll_product] = useState([]);

    useEffect(()=>{
        fetch('http://localhost:4000/allproducts')
        .then((response)=>response.json())
        .then((data)=>setAll_product(data))
     },[])

    const CarCareProducts = all_product.filter(product => product.category === 'Car_care');
    const firstFourItems = CarCareProducts.slice(0, 4);
    

    return (
        <div>
        <div className='heading'>
            <h1 className='CarCare-title'>CAR CARE PRODUCTS</h1>
            < Link to='/carcare' className='link'>
                view more
            </Link>
        </div>
        <div className='CarCare'>
            <hr />
            <div className='CarCare-item'>
            {firstFourItems.map((item, i) => {
                return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />;
            })}
            </div>
        </div>
        </div>
    );
};

export default CarCare;

