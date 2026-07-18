import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
  const [formData, setFormData] = useState({ classId: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://vcp-rs8t.onrender.com/create-class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classId: formData.classId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to start class");
        return;
      }
      
      localStorage.setItem("teachertoken", data.token2);
        
      navigate("/teacherQuery");
      
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    }

    setFormData({ classId: "" });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>Teacher Dashboard</h2>
        <p style={{ marginBottom: "24px", color: "var(--text-muted)" }}>
          Start a new virtual classroom session by providing a unique Class ID.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="classId"
            value={formData.classId}
            onChange={handleChange}
            placeholder="Create Class ID (e.g. MATH101)"
            required
            className="input-field"
          />

          <button type="submit" className="btn-primary" style={{ backgroundColor: 'var(--secondary)' }}>Start Class</button>
        </form>

        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
};

export default TeacherDashboard;
