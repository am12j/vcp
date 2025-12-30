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
      const response = await fetch("http://localhost:5000/create-class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classId: formData.classId }),
      });

      const data = await response.json();
      
      localStorage.setItem("teachertoken", data.token2);
        
      navigate("/teacherQuery");
     
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }

    setFormData({ classId: "" });
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Teachers Dashboard</h2>

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

        <input type="submit" value="Create Class" style={buttonStyle} />
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
  backgroundColor: "#eef2f7",
};

const headingStyle = {
  marginBottom: "20px",
  color: "#1f2933",
};

const formStyle = {
  backgroundColor: "#ffffff",
  padding: "30px",
  borderRadius: "10px",
  boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
  display: "flex",
  flexDirection: "column",
  width: "320px",
};

const inputStyle = {
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  fontSize: "16px",
};

const buttonStyle = {
  padding: "12px",
  backgroundColor: "#0f766e",
  color: "#ffffff",
  border: "none",
  borderRadius: "6px",
  fontSize: "16px",
  cursor: "pointer",
};

const errorStyle = {
  marginTop: "15px",
  color: "red",
};

export default TeacherDashboard;
