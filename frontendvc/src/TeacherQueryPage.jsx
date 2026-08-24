import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import { startTeacherCall, endTeacherCall } from "./teachercall"; 

const socket = io("https://vcp-rs8t.onrender.com");

const VideoPlayer = ({ stream, isLocal }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocal}
      style={{
        width: "100%",
        borderRadius: "8px",
        backgroundColor: "#000",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    />
  );
};

function TeacherQueryPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ query: "" });
  const userName = "Teacher";
  const [messages, setMessages] = useState([]);
  const [callActive, setCallActive] = useState(false); 
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("teachertoken") || localStorage.getItem("ttoken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => socket.off("receiveMessage");
  }, [navigate]);

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
    startTeacherCall(
      socket,
      (stream) => setLocalStream(stream),
      (studentId, stream) => setRemoteStreams((prev) => ({ ...prev, [studentId]: stream }))
    ); 
    setCallActive(true); 
  };

  const handleEndCall = () => {
    endTeacherCall(socket); 
    setLocalStream(null);
    setRemoteStreams({});
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

        {callActive && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            {localStream && (
              <div>
                <h4 style={{marginBottom: '5px', fontSize: '14px', color: 'var(--text-color)'}}>You (Teacher)</h4>
                <VideoPlayer stream={localStream} isLocal={true} />
              </div>
            )}
            {Object.entries(remoteStreams).map(([studentId, stream]) => (
              <div key={studentId}>
                <h4 style={{marginBottom: '5px', fontSize: '14px', color: 'var(--text-color)'}}>Student</h4>
                <VideoPlayer stream={stream} isLocal={false} />
              </div>
            ))}
          </div>
        )}

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
