import React, { createContext, useEffect, useState } from "react";

export const ProductContext = createContext(null);

const getDefaultCart = () => {
  const cart = {};
  for (let i = 0; i <= 300; i++) cart[i] = 0;
  return cart;
};

const API_BASE = process.env.BACKEND_API_URL || "http://localhost:4000";

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { Accept: "application/json", ...(options.headers || {}) },
    ...options,
  });

  // Read body once
  const raw = await res.text();
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data = isJson && raw ? JSON.parse(raw) : null;

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || raw || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data; // may be null for 204
}

const ProductContextProvider = (props) => {
  const [all_product, setAll_product] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());

  useEffect(() => {
    const token = localStorage.getItem("auth-token");

    // Load products (send token if route is protected)
    fetchJSON(`${API_BASE}/allproducts`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((data) => setAll_product(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.warn("allproducts failed:", err.message);
        setAll_product([]); // keep UI stable
      });

    // Load cart only if logged in
    if (token) {
      fetchJSON(`${API_BASE}/getcart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // your server also accepts 'auth-token' if you prefer
        },
        body: "{}",
      })
        .then((data) => data && setCartItems(data))
        .catch((err) => console.warn("getcart failed:", err.message));
    }
  }, []);

  const addToCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));

    const token = localStorage.getItem("auth-token");
    if (!token) return;

    fetchJSON(`${API_BASE}/addtocart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ itemId }),
    }).catch((err) => console.warn("addtocart failed:", err.message));
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));

    const token = localStorage.getItem("auth-token");
    if (!token) return;

    fetchJSON(`${API_BASE}/removefromcart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ itemId }),
    }).catch((err) => console.warn("removefromcart failed:", err.message));
  };

  const getTotalCartAmount = () => {
    let total = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = all_product.find((p) => p.id === Number(item));
        if (itemInfo?.new_price != null) {
          total += itemInfo.new_price * cartItems[item];
        }
      }
    }
    return total;
  };

  const getTotalCartItems = () => {
    let total = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) total += cartItems[item];
    }
    return total;
  };

  const contextValue = {
    getTotalCartItems,
    getTotalCartAmount,
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
  };

  return <ProductContext.Provider value={contextValue}>{props.children}</ProductContext.Provider>;
};

export default ProductContextProvider;
