import React, { useState } from 'react';
import './SignUp.css';

const AdminSignupForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roles: []
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Validate email field
        if (name === 'email') {
            const isValidEmail = /\S+@\S+\.\S+/.test(value);
            setErrors({
                ...errors,
                email: isValidEmail ? '' : 'Invalid email format'
            });
        }

        // Validate password field
        if (name === 'password') {
            const isValidPassword = value.length >= 6; // Minimum 6 characters
            setErrors({
                ...errors,
                password: isValidPassword ? '' : 'Password must be at least 6 characters long'
            });
        }
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        let updatedRoles = [...formData.roles]; // Create a copy of the roles array

        if (checked) {
            updatedRoles.push(value); // Add the role value to the array if checked
        } else {
            updatedRoles = updatedRoles.filter(role => role !== value); // Remove the role value if unchecked
        }

        setFormData({
            ...formData,
            roles: updatedRoles // Update the roles array in formData
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('https://vehicle-sever.onrender.com/adminsignup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // Handle successful signup
                console.log('Admin signed up successfully!');
                console.log('Token:', data.token);
                alert('User Added Successfully')
                window.location.reload()
            } else {
                // Handle signup errors
                console.error('Signup error:', data.errors);
                // Optionally display errors to the user
            }
        } catch (error) {
            console.error('Error during signup:', error);
            // Handle other errors, e.g., network issues
        }
    };

    return (
        <div className='user-form'>
            <h2 className='User-head'>Create User</h2>
            <form onSubmit={handleSubmit}>
                <div className='block-container'>
                    <label className='head-input' htmlFor="name">Name:</label>
                    <input className='data'
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className='block-container'>
                    <label className='head-input' htmlFor="email">Email:</label>
                    <input className='data'
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className='block-container'>
                    <label className='head-input' htmlFor="password">Password:</label>
                    <input className='data'
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className='block-container'>
                    <p className='roles'>Select Access:</p>
                    <div className='checkbox-container'>
                        <label className='head-input'>
                            <input className='data'
                                type="checkbox"
                                name="roles"
                                value="1"
                                onChange={handleCheckboxChange}
                            />
                            Dashboard
                        </label>
                        <label className='head-input'>
                            <input className='data'
                                type="checkbox"
                                name="roles"
                                value="2"
                                onChange={handleCheckboxChange}
                            />
                            Home
                        </label>
                        <label className='head-input'>
                            <input className='data'
                                type="checkbox"
                                name="roles"
                                value="3"
                                onChange={handleCheckboxChange}
                            />
                            Users
                        </label>
                        <label className='head-input'>
                            <input className='data'
                                type="checkbox"
                                name="roles"
                                value="4"
                                onChange={handleCheckboxChange}
                            />
                            Service
                        </label>
                        <label className='head-input'>
                            <input className='data'
                                type="checkbox"
                                name="roles"
                                value="5"
                                onChange={handleCheckboxChange}
                            />
                            Booking
                        </label>
                        <label className='head-input'>
                            <input className='data'
                                type="checkbox"
                                name="roles"
                                value="6"
                                onChange={handleCheckboxChange}
                            />
                            Issue
                        </label>
                        <label className='head-input'>
                            <input className='data'
                                type="checkbox"
                                name="roles"
                                value="7"
                                onChange={handleCheckboxChange}
                            />
                            Inventory
                        </label>
                        <label className='head-input'>
                            <input className='data'
                                type="checkbox"
                                name="roles"
                                value="8"
                                onChange={handleCheckboxChange}
                            />
                            Supplier
                        </label>
                        <label className='head-input'>
                            <input className='data'
                                type="checkbox"
                                name="roles"
                                value="9"
                                onChange={handleCheckboxChange}
                            />
                            Employee
                        </label>
                        <label className='head-input'>
                            <input className='data'
                                type="checkbox"
                                name="roles"
                                value="10"
                                onChange={handleCheckboxChange}
                            />
                            Payment
                        </label>
                        <label className='head-input'>
                            <input className='data'
                                type="checkbox"
                                name="roles"
                                value="11"
                                onChange={handleCheckboxChange}
                            />
                            Online shop
                        </label>
                        <label className='head-input'>
                            <input className='data'
                                type="checkbox"
                                name="roles"
                                value="12"
                                onChange={handleCheckboxChange}
                            />
                            Customer
                        </label>
                    </div>
                </div>
                <button className='con' type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default AdminSignupForm;
