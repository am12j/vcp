import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // role is ONLY "student" or "teacher"
      const role = data.username1.trim().toLowerCase();
      console.log("ROLE:", role);

      if (role === "student") {
        localStorage.setItem("stoken", data.token1);
        localStorage.setItem("user", data.username1);
        navigate("/studentdas", { replace: true });
      } 
      else if (role === "teacher") {
        localStorage.setItem("ttoken", data.token1);
        localStorage.setItem("user", data.username1);
        navigate("/teacherdas", { replace: true });
      } 
      else {
        alert("Invalid role in database");
      }

    } catch (err) {
      console.error("Login Error:", err);
      alert("Server is not responding");
    }
  };

  const formContainerStyle = {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
    margin: "0 auto"
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "1px solid #ddd"
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
    marginTop: "10px"
  };

  return (
    <div style={formContainerStyle}>
      <form onSubmit={handleSubmit}>
        <h2 style={{ marginBottom: "20px" }}>Login</h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          style={inputStyle}
          value={form.username}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          style={inputStyle}
          value={form.password}
          onChange={handleChange}
          required
        />

        <input type="submit" style={buttonStyle} value="Login" />
      </form>
    </div>
  );
}

export default Login;
