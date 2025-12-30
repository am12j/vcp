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
      const response = await fetch("http://localhost:5000/verify-class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classId: formData.classId }),
      });

      const data = await response.json();

      
      localStorage.setItem("studenttoken", data.token3);
        
      navigate("/student-query");
      
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    }

    setFormData({ classId: "" });
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Student Dashboard</h2>

      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="text"
          name="classId"
          value={formData.classId}
          onChange={handleChange}
          placeholder="Enter Class ID"
          required
          style={inputStyle}
        />

        <input type="submit" value="Join Class" style={buttonStyle} />
      </form>

      {error && <p style={errorStyle}>{error}</p>}
    </div>
  );
};

/* ---------- CSS styles ---------- */

const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#f4f6f8",
};

const headingStyle = {
  marginBottom: "20px",
  color: "#333",
};

const formStyle = {
  backgroundColor: "#fff",
  padding: "30px",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  display: "flex",
  flexDirection: "column",
  width: "300px",
};

const inputStyle = {
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "16px",
};

const buttonStyle = {
  padding: "10px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "16px",
};

const errorStyle = {
  marginTop: "15px",
  color: "red",
};

export default StudentDashboard;
