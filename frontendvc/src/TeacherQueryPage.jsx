import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const socket = io("https://vcp-rs8t.onrender.com");

function TeacherQueryPage() {
  const [formData, setFormData] = useState({ query: "" });
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  // LISTEN to messages (runs once when page loads)
  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const messageData = {
      sender: "Teacher",
      text: formData.query,
    };

    // send to socket
    socket.emit("sendMessage", messageData);

    // show own message immediately
    setMessages((prev) => [...prev, messageData]);

    setFormData({ query: "" });
  };

  const handleLogout = () => {
    socket.disconnect();
    navigate("/login");
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <button onClick={handleLogout} style={logoutButtonStyle}>
          Logout
        </button>

        <h2 style={headingStyle}>Post an Announcement</h2>

        {/* MESSAGE DISPLAY */}
        <div style={messageBox}>
          {messages.map((msg, index) => (
            <p key={index}>
              <b>{msg.sender}:</b> {msg.text}
            </p>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            name="query"
            value={formData.query}
            onChange={handleChange}
            placeholder="Type your announcement or message..."
            required
            style={textareaStyle}
          />

          <input
            type="submit"
            value="Post Message"
            style={buttonStyle}
          />
        </form>
      </div>
    </div>
  );
}

/* ---------- CSS styles ---------- */

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #0f766e, #115e59)",
};

const cardStyle = {
  backgroundColor: "#ffffff",
  padding: "30px",
  borderRadius: "12px",
  width: "420px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
};

const headingStyle = {
  marginBottom: "15px",
  color: "#1f2933",
  textAlign: "center",
};

const messageBox = {
  height: "150px",
  border: "1px solid #ccc",
  padding: "10px",
  marginBottom: "15px",
  overflowY: "auto",
};

const textareaStyle = {
  width: "100%",
  height: "90px",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "15px",
  resize: "none",
  marginBottom: "15px",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#0f766e",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  cursor: "pointer",
};

const logoutButtonStyle = {
  marginBottom: "10px",
  padding: "8px 14px",
  backgroundColor: "#dc2626",
  color: "#ffffff",
  border: "none",
  borderRadius: "6px",
  fontSize: "14px",
  cursor: "pointer",
};

export default TeacherQueryPage;