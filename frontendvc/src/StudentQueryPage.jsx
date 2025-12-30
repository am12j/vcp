import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");
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

const messageBox = {
  height: "200px",
  overflowY: "auto",
  padding: "12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  marginBottom: "15px",
  backgroundColor: "#f1f5f9",
};

const textareaStyle = {
  width: "100%",
  height: "80px",
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
function StudentQueryPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const messageData = {
      sender: "Student",
      text: query,
    };

    socket.emit("sendMessage", messageData);
    setMessages((prev) => [...prev, messageData]);
    setQuery("");
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2>Student Queries</h2>

        <div style={messageBox}>
          {messages.map((msg, index) => (
            <p key={index}>
              <b>{msg.sender}:</b> {msg.text}
            </p>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your query..."
            required
            style={textareaStyle}
          />
          <input type="submit" value="Send" style={buttonStyle} />
        </form>
      </div>
    </div>
  );
}

/* same styles as teacher */

export default StudentQueryPage;
