import React, { useEffect, useState } from "react";
import "./login.css";

// Backend base URL (set VITE_API_URL in frontend/.env; falls back to localhost)
const API_BASE = process.env.BACKEND_API_URL || "http://localhost:4000";

const LoginSignup = () => {
  const [state, setState] = useState("Log In");
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    email: "",
    errors: {},
  });
  const [checkingSession, setCheckingSession] = useState(true);

  // If an OIDC session already exists, redirect in
useEffect(() => {
  (async () => {
    try {
      // Check if we just came back from Google login
      const params = new URLSearchParams(window.location.search);
      if (params.get("status") === "success") {
        const res = await fetch(`${API_BASE}/api/me`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          console.log("User logged in:", data.user);
          window.location.replace("/"); // go home
          return;
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingSession(false);
    }
  })();
}, []);


  const changeHandler = (e) => {
    const { name, value } = e.target;
    const errors = { ...formData.errors };

    switch (name) {
      case "name":
        errors.name =
          value.trim().length < 3 ? "Name must be at least 3 characters long" : "";
        break;
      case "email":
        errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ""
          : "Email address is invalid";
        break;
      case "password":
        errors.password =
          value.length < 6 ? "Password must be at least 6 characters long" : "";
        break;
      default:
        break;
    }

    setFormData({ ...formData, [name]: value, errors });
  };

  // Existing login (JWT)
  const login = async () => {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("auth-token", data.token);
        window.location.replace("/");
      } else {
        alert(data.errors || "Login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Network error during login");
    }
  };

  // Existing signup (JWT)
  const signup = async () => {
    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("auth-token", data.token);
        window.location.replace("/");
      } else {
        alert(data.errors || "Signup failed");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Network error during signup");
    }
  };

  // New: Google/OIDC login via backend BFF
  const continueWithGoogle = () => {
    window.location.href = `${API_BASE}/google`;
  };

  if (checkingSession) {
    return (
      <div className="loginSignup">
        <div className="loginSignup-container">
          <p>Checking session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loginSignup">
      <div className="loginSignup-container">
        <h1>{state}</h1>

        <div className="loginSignup-field">
          {state === "Sign Up" && (
            <>
              <input
                className="textby"
                type="text"
                name="name"
                value={formData.name}
                onChange={changeHandler}
                placeholder="Your Name"
                required
              />
              {formData.errors.name && <p className="error">{formData.errors.name}</p>}
            </>
          )}

          <input
            className="textby"
            type="email"
            name="email"
            value={formData.email}
            onChange={changeHandler}
            placeholder="Email Address"
            required
          />
          {formData.errors.email && <p className="error">{formData.errors.email}</p>}

          <input
            className="textby"
            type="password"
            name="password"
            value={formData.password}
            onChange={changeHandler}
            placeholder="Password"
            required
          />
          {formData.errors.password && (
            <p className="error">{formData.errors.password}</p>
          )}
        </div>

        <div className="loginSignup-agree">
          <input className="checkbox" type="checkbox" required />
          <p>By clicking continue, I agree to the terms &amp; conditions</p>
        </div>

        <button onClick={() => (state === "Log In" ? login() : signup())}>
          Continue
        </button>

        {/* OR divider */}
        <div className="or-divider" style={{ margin: "12px 0", textAlign: "center" }}>
          <span style={{ opacity: 0.6 }}>— or —</span>
        </div>

        {/* Google button */}
        <button
          type="button"
          onClick={continueWithGoogle}
          className="google-btn"
        >
          Continue with Google
        </button>

        {state === "Sign Up" ? (
          <p className="loginSignup-login">
            Already have an account?{" "}
            <span onClick={() => setState("Log In")}>Login Here</span>
          </p>
        ) : (
          <p className="loginSignup-login">
            Create an account?{" "}
            <span onClick={() => setState("Sign Up")}>Click Here</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;
