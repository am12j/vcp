import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

import { startTeacherCall, endTeacherCall } from "./teachercall"; 

const socket = io("https://vcp-rs8t.onrender.com");

function TeacherQueryPage() {
  const [formData, setFormData] = useState({ query: "" });
  const userName = localStorage.getItem("name") || "Teacher";
  const [messages, setMessages] = useState([]);
  const [callActive, setCallActive] = useState(false); 


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
    if (!formData.query.trim()) return;
    const messageData = { sender: userName, text: formData.query };
    socket.emit("sendMessage", messageData);
    setMessages((prev) => [...prev, messageData]);
    setFormData({ query: "" });
  };

  const handleStartCall = () => {
    startTeacherCall(); 
    setCallActive(true); 
  };

  const handleEndCall = () => {
    endTeacherCall(); 
    setCallActive(false); 
  };

  return (
    <div className="query-page-container">
      <div className="query-card">
        <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Post an Announcement</h2>

        <div style={{ marginBottom: '20px' }}>
          {!callActive ? (
            <button onClick={handleStartCall} className="btn-primary" style={{ backgroundColor: 'var(--secondary)' }}>
              Start Video Call
            </button>
          ) : (
            <button onClick={handleEndCall} className="btn-primary" style={{ backgroundColor: 'var(--danger)' }}>
              End Call
            </button>
          )}
        </div>

        <div className="chat-container">
          <div className="chat-messages">
            {messages.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>
                No announcements yet. Start the conversation!
              </p>
            )}
            {messages.map((msg, index) => {
              const isMe = msg.sender === userName;
              return (
                <div key={index} className={`message ${isMe ? 'sent' : ''}`}>
                  <div className="message-sender">{msg.sender}</div>
                  <div className="message-bubble">{msg.text}</div>
                </div>
              );
            })}
          </div>

          <form className="chat-input-area" onSubmit={handleSubmit}>
            <input
              type="text"
              name="query"
              value={formData.query}
              onChange={handleChange}
              placeholder="Type your announcement..."
              required
              className="input-field"
              style={{ borderRadius: '20px' }}
            />
            <button type="submit" className="btn-primary" style={{ borderRadius: '20px' }}>
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TeacherQueryPage;
