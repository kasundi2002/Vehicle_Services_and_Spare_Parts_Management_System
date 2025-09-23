// src/Components/AuthStatus.jsx
import { useEffect, useState } from "react";

export default function AuthStatus() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/me", {
      method: "GET",
      credentials: "include", // 👈 send cookie
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setData({ error: e.message }));
  }, []);

  if (!data) return <div style={{ padding: 16 }}>Checking session…</div>;
  if (data.error) return <div style={{ padding: 16 }}>Not logged in</div>;
  return (
    <div style={{ padding: 16 }}>
      Logged in as <b>{data.user?.name || data.user?.email}</b>
    </div>
  );
}
