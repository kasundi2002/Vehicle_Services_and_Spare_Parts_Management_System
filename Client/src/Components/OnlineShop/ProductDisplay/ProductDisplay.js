import React, { useContext, useEffect, useState } from 'react';
import './ProductDisplay.css';
import StarIcon from '@mui/icons-material/Star';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import { ProductContext } from '../../../Context/ProductContext';

const ProductDisplay = (props) => {
    const { product } = props;
    const { addToCart } = useContext(ProductContext);
    const [isOutOfStock, setIsOutOfStock] = useState(false);

    useEffect(() => {
        checkQuantity();
    }, [product.id]); // Run whenever product.id changes

    const checkQuantity = () => {
        fetch(`http://localhost:4000/product/quantity/${product.id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            setIsOutOfStock(product.quantity <= 0);
        })
        .catch(error => {
            console.error('There was a problem with the request:', error);
        });
    };

    const handleAddToCart = () => {
        fetch(`http://localhost:4000/product/quantity/${product.id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.quantity <= 0) {
                setIsOutOfStock(true); // Update state here
            } else {
                addToCart(product.id);
            }
        })
        .catch(error => {
            console.error('There was a problem with the request:', error);
        });
    };

    return (
        <div className='productDisplay'>
            <div className='productDisplay-left'>
                <div className='productDisplay-img-list'>
                    <img src={product.image} alt=""/>
                    <img src={product.image} alt=""/>
                    <img src={product.image} alt=""/>
                    <img src={product.image} alt=""/>
                </div>
                <div className='productDisplay-img'>
                    <img className='productDisplay-main-img' src={product.image} alt=""/>
                </div>
            </div>
            <div className='productDisplay-right'>
                <h1>{product.name}</h1>
                <div className='productDisplay-right-stars'>
                    <StarIcon className='star'/>
                    <StarIcon className='star'/>
                    <StarIcon className='star'/>
                    <StarIcon className='star'/>
                    <StarBorderOutlinedIcon className='star'/>
                    <p>(122)</p>
                </div>
                <div className="productDisplay-right-prices">
                    <div className='productDisplay-right-prices-old'>Rs.{product.old_price}</div>
                    <div className='productDisplay-right-prices-new'>Rs.{product.new_price}</div>
                </div>
                <div className='productDisplay-right-description'>{product.description}</div>
                {isOutOfStock ? (
                    <p className='productDisplay-out-of-stock'>Product is out of stock</p>
                ) : (
                    <button onClick={handleAddToCart} disabled={isOutOfStock}>ADD TO CART</button>
                )}
                <p className='productDispay-right-category'><span>Category :</span>{product.category}</p>
                <p className='productDispay-right-brand'><span>Brand :</span>{product.brand}</p>
            </div>
        </div>
    );
};

export default ProductDisplay;