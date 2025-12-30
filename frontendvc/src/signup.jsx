import React, { useState } from 'react';

// --- Define styles outside to prevent re-creation on every render ---
const formContainerStyle = {
  background: "white",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  width: "100%",
  maxWidth: "400px",
  margin: "0 auto",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  margin: "10px 0",
  borderRadius: "6px",
  border: "1px solid #ddd",
  boxSizing: "border-box", // Critical for keeping padding inside the width
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#4a90e2",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
  marginTop: "10px",
};

const messageStyle = {
  marginTop: "15px",
  color: "#333",
  fontWeight: "500"
};

function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  // handleChange remains inside because it needs setForm
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const t = await response.text(); 
      document.getElementById("k").innerText = t;

    } catch (error) {
      document.getElementById("k").innerText = "Server error";
      console.error(error);
    }
  };

  return (
    <div style={formContainerStyle}>
      <form onSubmit={handleSubmit}>
        <h2 style={{ color: "#333", marginBottom: "20px" }}>Signup</h2>
        
        <input
          type="text"
          name="username"
          placeholder="teacher or student"
          style={inputStyle}
          value={form.username}
          onChange={handleChange}
          required
        />
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          style={inputStyle}
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="new-password"
          style={inputStyle}
          value={form.password}
          onChange={handleChange}
          required
        />

        <input type="submit" style={buttonStyle} value="Create Account" />

        <p id="k" style={messageStyle}></p>
      </form>
    </div>
  );
}

export default Signup;