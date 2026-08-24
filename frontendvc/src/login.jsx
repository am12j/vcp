import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("https://vcp-rs8t.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        setIsLoading(false);
        return;
      }

      // role is "student" or "teacher"
      const role = data.username1.trim().toLowerCase();
      console.log("ROLE:", role);

      // Clear any previous token
      localStorage.removeItem("stoken");
      localStorage.removeItem("ttoken");

      if (role === "student" || role.startsWith("student")) {
        // Set only 1 localStorage for student
        localStorage.setItem("stoken", data.token1);

        setForm({ name: "", username: "", password: "" });
        navigate("/studentdas", { replace: true });
      } 
      else if (role === "teacher" || role.startsWith("teacher")) {
        // Set only 1 localStorage for teacher
        localStorage.setItem("ttoken", data.token1);

        setForm({ name: "", username: "", password: "" });
        navigate("/teacherdas", { replace: true });
      } 
      else {
        alert("Invalid role in database. Username must be student or teacher");
      }

    } catch (err) {
      console.error("Login Error:", err);
      alert("Server is not responding. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <form onSubmit={handleSubmit}>
          <h2>Login</h2>

          <input
            type="text"
            name="name"
            placeholder="Your Display Name"
            className="input-field"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="username"
            placeholder="Username (e.g. student or teacher)"
            className="input-field"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="input-field"
            value={form.password}
            onChange={handleChange}
            pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$"
            title="Password must be at least 8 characters long, contain at least one letter, one number, and one special character."
            required
          />

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)' }}>Sign up here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
