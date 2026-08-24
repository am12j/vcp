import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg("Logging in (connecting to server)...");

    try {
      const response = await fetch("https://vcp-rs8t.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        setIsLoading(false);
        setStatusMsg("");
        return;
      }

      // Check role - if username contains teacher, it's teacher; otherwise student
      const userStr = (data.username1 || form.username).trim().toLowerCase();
      const isTeacher = userStr.includes("teacher");
      const displayName = form.name.trim() || data.name1 || data.username1 || form.username;

      // Clear any previous session tokens
      localStorage.removeItem("stoken");
      localStorage.removeItem("ttoken");
      localStorage.removeItem("studenttoken");
      localStorage.removeItem("teachertoken");
      localStorage.removeItem("name");

      // Save user's display name for chat and greeting
      localStorage.setItem("name", displayName);

      if (isTeacher) {
        localStorage.setItem("ttoken", data.token1);
        setForm({ name: "", username: "", password: "" });
        navigate("/teacherdas", { replace: true });
      } else {
        localStorage.setItem("stoken", data.token1);
        setForm({ name: "", username: "", password: "" });
        navigate("/studentdas", { replace: true });
      }

    } catch (err) {
      console.error("Login Error:", err);
      alert("Server is waking up or not responding. Please try again in a few seconds.");
    } finally {
      setIsLoading(false);
      setStatusMsg("");
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
            placeholder="Your Display Name (e.g. John Doe)"
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
            required
          />

          {statusMsg && (
            <p style={{ color: "var(--primary)", fontSize: "0.85rem", marginBottom: "15px", fontWeight: "500" }}>
              {statusMsg}
            </p>
          )}

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
