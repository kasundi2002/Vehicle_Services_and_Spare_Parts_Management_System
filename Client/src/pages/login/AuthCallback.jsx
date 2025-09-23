// src/pages/login/AuthCallback.jsx
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("auth-token", token);
      window.location.replace("/"); // or use navigate("/")
    }
  }, [searchParams]);

  return null; // or a spinner/loading UI
}
