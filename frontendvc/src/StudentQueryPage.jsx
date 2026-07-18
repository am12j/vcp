import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { startStudentCall, endStudentCall } from "./studentcall"; 

const socket = io("https://vcp-rs8t.onrender.com");

function StudentQueryPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [incomingCall, setIncomingCall] = useState(false); 
  const [inCall, setInCall] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("receiveMessage", (data) =>
      setMessages((prev) => [...prev, data])
    );

    socket.on("offer", () => {
      setIncomingCall(true); 
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("offer");
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const messageData = { sender: "Student", text: query };
    socket.emit("sendMessage", messageData);
    setMessages((prev) => [...prev, messageData]);
    setQuery("");
  };

  const handleAccept = () => {
    startStudentCall();
    setInCall(true);
  };

  const handleEnd = () => {
    endStudentCall();
    setInCall(false);
    setIncomingCall(false); 
  };

  return (
    <div className="query-page-container">
      <div className="query-card">
        <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Live Classroom Chat</h2>

        {incomingCall && (
          <div style={{ display: 'flex', gap: '15px', marginBottom: "20px" }}>
            <button
              onClick={handleAccept}
              disabled={inCall}
              className="btn-primary"
              style={{ backgroundColor: inCall ? '#9CA3AF' : 'var(--secondary)' }}
            >
              {inCall ? 'Call Active' : 'Accept Video Call'}
            </button>

            <button
              onClick={handleEnd}
              className="btn-primary"
              style={{ backgroundColor: 'var(--danger)' }}
            >
              End Call
            </button>
          </div>
        )}

        <div className="chat-container">
          <div className="chat-messages">
            {messages.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>
                No messages yet. Start the conversation!
              </p>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.sender === "Student";
              return (
                <div key={i} className={`message ${isMe ? 'sent' : ''}`}>
                  <div className="message-sender">{msg.sender}</div>
                  <div className="message-bubble">{msg.text}</div>
                </div>
              );
            })}
          </div>

          <form className="chat-input-area" onSubmit={handleSubmit}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your query..."
              required
              className="input-field"
              style={{ borderRadius: '20px' }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ borderRadius: '20px' }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StudentQueryPage;
