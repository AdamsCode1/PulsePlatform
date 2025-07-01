"use client";
import React, { useEffect, useState } from "react";

export default function AdminPage() {
  const [signups, setSignups] = useState([]);
  const [error, setError] = useState("");
  const [secret, setSecret] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    fetch("/api/early-access/admin", {
      headers: { authorization: `Bearer ${secret}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          setError(data.message || "Unauthorized");
          setSignups([]);
        } else {
          setError("");
          res.json().then((data) => setSignups(data.signups || []));
        }
      })
      .catch(() => setError("Failed to fetch signups"));
  }, [secret, submitted]);

  if (!submitted) {
    return (
      <div style={{ maxWidth: 400, margin: "4rem auto", textAlign: "center" }}>
        <h2>Admin Login</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <input
            type="password"
            placeholder="Admin Secret"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            style={{ padding: "0.7em 1em", borderRadius: 8, border: "1px solid #ccc", width: "100%", marginBottom: 16 }}
          />
          <button type="submit" style={{ padding: "0.7em 2em", borderRadius: 8, background: "#FF2EB6", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>
            View Signups
          </button>
        </form>
        {error && <div style={{ color: "#FF2EB6", marginTop: 12 }}>{error}</div>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto" }}>
      <h1>Early Access Sign-ups</h1>
      {error && <div style={{ color: "#FF2EB6", marginBottom: 12 }}>{error}</div>}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24 }}>
        <thead>
          <tr style={{ background: "#f8a1d1" }}>
            <th style={{ padding: 8, border: "1px solid #eee" }}>Name</th>
            <th style={{ padding: 8, border: "1px solid #eee" }}>Year Group</th>
            <th style={{ padding: 8, border: "1px solid #eee" }}>Email</th>
            <th style={{ padding: 8, border: "1px solid #eee" }}>Signed Up</th>
          </tr>
        </thead>
        <tbody>
          {signups.map((s: any) => (
            <tr key={s.id}>
              <td style={{ padding: 8, border: "1px solid #eee" }}>{s.name}</td>
              <td style={{ padding: 8, border: "1px solid #eee" }}>{s.year_group}</td>
              <td style={{ padding: 8, border: "1px solid #eee" }}>{s.email}</td>
              <td style={{ padding: 8, border: "1px solid #eee" }}>{new Date(s.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 