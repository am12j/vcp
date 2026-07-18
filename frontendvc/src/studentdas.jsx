import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [formData, setFormData] = useState({ classId: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://vcp-rs8t.onrender.com/verify-class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classId: formData.classId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid Class ID");
        return;
      }
      
      localStorage.setItem("studenttoken", data.token3);
        
      navigate("/student-query");
      
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    }

    setFormData({ classId: "" });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>Student Dashboard</h2>
        <p style={{ marginBottom: "24px", color: "var(--text-muted)" }}>
          Join an active virtual classroom session by entering your Class ID.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="classId"
            value={formData.classId}
            onChange={handleChange}
            placeholder="Enter Class ID (e.g. 123456)"
            required
            className="input-field"
          />

          <button type="submit" className="btn-primary">Join Class</button>
        </form>

        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
};

export default StudentDashboard;
