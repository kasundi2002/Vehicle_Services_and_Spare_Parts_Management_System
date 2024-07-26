import React, { useEffect, useState } from 'react';
import './RelatedProducts.css'
import Item from '../item/item'

const RelatedProducts = (props) => {
    
    const [all_product,setAll_product] = useState([]);

    useEffect(()=>{
        fetch('https://vehicle-sever.onrender.com/allproducts')
        .then((response)=>response.json())
        .then((data)=>setAll_product(data))
     },[])
    
    const {product} = props;
    let related;

    if(product.category === 'Car_care'){

        related = all_product.filter(product => product.category === 'Car_care').slice(0, 4);

        return (
            <div className='RelatedProducts'>
                <h1>Related Products</h1>
                <hr />
                <div className='RelatedProducts-items'>
                    {related.map((item, i) => {
                    return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />;
                    })}
                </div>
            </div>
          )
    }else if(product.category === 'Interiour'){

        related = all_product.filter(product => product.category === 'Interiour').slice(0, 4);

        return (
            <div className='RelatedProducts'>
                <h1>Related Products</h1>
                <hr />
                <div className='RelatedProducts-items'>
                    {related.map((item, i) => {
                    return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />;
                    })}
                </div>
            </div>
          )
    }else if(product.category === 'Exteriour'){

        related = all_product.filter(product => product.category === 'Exteriour').slice(0, 4);

        return (
            <div className='RelatedProducts'>
                <h1>Related Products</h1>
                <hr />
                <div className='RelatedProducts-items'>
                    {related.map((item, i) => {
                    return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />;
                    })}
                </div>
            </div>
          )
    }


  
}

export default RelatedProducts