import React, { useContext, useState } from 'react';
import './Checkout.css';
import { ProductContext } from '../../../Context/ProductContext';
import axios from 'axios';

const Checkout = () => {
    const { getTotalCartAmount, cartItems, all_product } = useContext(ProductContext);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        address: '',
        contact: '',
        paymentMethod: 'Cash On Delivery',
    });

    const [errors, setErrors] = useState({
        fullName: '',
        email: '',
        address: '',
        contact: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear the error message when user starts typing again
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Validate the form fields
            const validationErrors = {};
            if (!formData.fullName.trim()) {
                validationErrors.fullName = 'Please enter your full name';
            }
            if (!formData.email.trim()) {
                validationErrors.email = 'Please enter your email address';
            } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
                validationErrors.email = 'Please enter a valid email address';
            }
            if (!formData.address.trim()) {
                validationErrors.address = 'Please enter your shipping address';
            }
            if (!formData.contact.trim()) {
                validationErrors.contact = 'Please enter your contact number';
            } else if (!/^\d{10}$/.test(formData.contact)) {
                validationErrors.contact = 'Please enter a valid 10-digit contact number';
            }

            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return; // Don't proceed further if there are validation errors
            }

            // If form fields are valid, proceed with checkout process
            const totalAmount = getTotalCartAmount().toFixed(2);
            const items = Object.keys(cartItems).map((itemId) => {
                const itemQuantity = cartItems[itemId];
                if (itemQuantity > 0) {
                    const product = all_product.find((product) => product.id === Number(itemId));
                    if (product) {
                        return {
                            productId: product.id,
                            quantity: itemQuantity,
                            totalPrice: product.new_price * itemQuantity,
                        };
                    }
                }
                return null;
            }).filter(Boolean);

            const confirmed = window.confirm('Are you sure you want to place this order?');
            if (confirmed) {
                const authToken = localStorage.getItem('auth-token');
                if (authToken) {
                    const response = await axios.post('http://localhost:4000/checkout', {
                        ...formData,
                        totalAmount,
                        items,
                    }, {
                        headers: {
                            'auth-token': authToken
                        }
                    });

                    setFormData({
                        fullName: '',
                        email: '',
                        address: '',
                        contact: '',
                        paymentMethod: 'Cash On Delivery',
                    });

                    console.log('Order placed successfully. Order ID:', response.data.orderId);
                    window.location.replace("/onlineshop");
                    window.alert("Your order placed successfully");
                } else {
                    console.error('No authentication token found.');
                }
            } else {
                console.log('Order placement cancelled by user.');
            }
        } catch (error) {
            console.error('Error while placing order:', error.response.data.error);
        }
    };

    return (
        <div className='Checkout'>
            <h2>Checkout</h2>
            <div className='checkout-items'>
                {Object.keys(cartItems).map((itemId) => {
                    const itemQuantity = cartItems[itemId];
                    if (itemQuantity > 0) {
                        const product = all_product.find((product) => product.id === Number(itemId));
                        if (product) {
                            return (
                                <div key={itemId}>
                                    <p>Name: {product.name}</p>
                                    <img className='sampleimg' src={product.image} alt=""/>
                                    <p>Quantity: {itemQuantity}</p>
                                    <p>Total Price: Rs.{(product.new_price * itemQuantity).toFixed(2)}</p>
                                </div>
                            );
                        }
                    }
                    return null;
                })}
            </div>

            <form onSubmit={handleSubmit}>
                <input
                    type='text'
                    name='fullName'
                    placeholder='Full Name'
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                />
                {errors.fullName && <p className="error">{errors.fullName}</p>}
                <input
                    type='email'
                    name='email'
                    placeholder='Email Address'
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                {errors.email && <p className="error">{errors.email}</p>}
                <textarea
                    name='address'
                    placeholder='Shipping Address'
                    value={formData.address}
                    onChange={handleChange}
                    required
                ></textarea>
                {errors.address && <p className="error">{errors.address}</p>}
                <input
                    type='tel'
                    name='contact'
                    placeholder='Contact Number'
                    value={formData.contact}
                    onChange={handleChange}
                    required
                />
                {errors.contact && <p className="error">{errors.contact}</p>}
                <select name='paymentMethod' value={formData.paymentMethod} onChange={handleChange}>
                    <option value='Cash On Delivery'>Cash On Delivery</option>
                </select>
                <div className='checkout-total'>
                    <h3>Total Amount: Rs.{getTotalCartAmount().toFixed(2)}</h3>
                </div>
                <button type='submit'>Place Order</button>
            </form>
        </div>
    );
};

export default Checkout;
