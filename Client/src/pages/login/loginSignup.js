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
      case "name":
        errors.name = value.length < 3 ? "Name must be at least 3 characters long" : "";
        break;
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
      const response = await fetch('https://vehicle-sever.onrender.com/login', {
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
      localStorage.setItem('auth-token', responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.errors);
    }
  };

  const signup = async () => {
    let responseData;
    try {
      const response = await fetch('https://vehicle-sever.onrender.com/signup', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      responseData = await response.json();
    } catch (error) {
      console.error('Error during signup:', error);
      return;
    }

    if (responseData.success) {
      localStorage.setItem('auth-token', responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.errors);
    }
  };

  return (
    <div className='loginSignup'>
      <div className='loginSignup-container'>
        <h1>{state}</h1>
        <div className='loginSignup-field'>
          {state === "Sign Up" ? <input className='textby' type="text" name="name" value={formData.name} onChange={changeHandler} placeholder='Your Name' required/> : <></>}
          {formData.errors.name && <p className="error">{formData.errors.name}</p>} {/* Display name error */}
          <input className='textby' type='email' name="email" value={formData.email} onChange={changeHandler} placeholder='Email Address' />
          {formData.errors.email && <p className="error">{formData.errors.email}</p>} {/* Display email error */}
          <input className='textby' type='password' name="password" value={formData.password} onChange={changeHandler} placeholder='Password' required/>
          {formData.errors.password && <p className="error">{formData.errors.password}</p>} {/* Display password error */}
        </div>
        <div className='loginSignup-agree'>
          <>
            <input className='checkbox' type='checkbox' name='' id='' required/>
            <p>By clicking continue, I agree to the terms & conditions</p>
          </>
        </div>
        <button onClick={() => { state === "Log In" ? login() : signup() }}>continue</button>
        {state === "Sign Up"
          ? <p className='loginSignup-login'>Already have an account?<span onClick={() => { setState("Log In") }}>Login Here</span></p>
          : <p className='loginSignup-login'>Create an account?<span onClick={() => { setState("Sign Up") }}>Click Here</span></p>}
      </div>
    </div>
  );
};

export default LoginSignup;
