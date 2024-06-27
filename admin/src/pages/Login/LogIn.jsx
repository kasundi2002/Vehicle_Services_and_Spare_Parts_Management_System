import React, { useState } from 'react';
import './login.css';

const LoginSignup = () => {
  const [state, setState] = useState("Log In");
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    email: "",
    errors: {}
  });

  const changeHandler = (e) => {
    const { name, value } = e.target;
    let errors = { ...formData.errors };
    
    switch (name) {
      case "email":
        errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Email address is invalid";
        break;
      case "password":
        errors.password = value.length < 6 ? "Password must be at least 6 characters long" : "";
        break;
      default:
        break;
    }
    
    setFormData({ ...formData, [name]: value, errors });
  };

  const login = async () => {
    let responseData;
    try {
      const response = await fetch('http://localhost:4000/adminlogin', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      responseData = await response.json();
    } catch (error) {
      console.error('Error during login:', error);
      return;
    }

    if (responseData.success) {
      sessionStorage.setItem('authToken', responseData.token);
      window.location.replace("/home");
    } else {
      alert(responseData.errors);
    }
  };

  return (
    <div className='loginSignup'>
      <div className='loginSignup-container'>
        <h1>{state}</h1>
        <div className='loginSignup-field'>
          <input className='textby' type='email' name="email" value={formData.email} onChange={changeHandler} placeholder='Email Address' />
          {formData.errors.email && <p className="error">{formData.errors.email}</p>} {/* Display email error */}
          <input className='textby' type='password' name="password" value={formData.password} onChange={changeHandler} placeholder='Password' required/>
          {formData.errors.password && <p className="error">{formData.errors.password}</p>} {/* Display password error */}
        </div>
        <button onClick={() => { state === "Log In" ? login() : signup() }}>continue</button>
      </div>
    </div>
  );
};

export default LoginSignup;
