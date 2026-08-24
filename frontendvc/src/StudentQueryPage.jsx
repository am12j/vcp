import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

import { startStudentCall, endStudentCall } from "./studentcall"; 

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

function StudentQueryPage() {
  const [query, setQuery] = useState("");
  const userName = "Student";
  const [messages, setMessages] = useState([]);
  const [incomingCall, setIncomingCall] = useState(false); 
  const [inCall, setInCall] = useState(false); 
  const [teacherId, setTeacherId] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    socket.on("receiveMessage", (data) =>
      setMessages((prev) => [...prev, data])
    );

    socket.on("teacher-ready", (data) => {
      setTeacherId(data.teacherId);
      setIncomingCall(true); 
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("teacher-ready");
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const messageData = { sender: userName, text: query };
    socket.emit("sendMessage", messageData);
    setMessages((prev) => [...prev, messageData]);
    setQuery("");
  };

  const handleAccept = () => {
    if (!teacherId) return;
    startStudentCall(
      socket,
      teacherId,
      (stream) => setLocalStream(stream),
      (stream) => setRemoteStream(stream)
    );
    setInCall(true);
    setIncomingCall(false); // Hide the accept button
  };

  const handleEnd = () => {
    endStudentCall(socket);
    setLocalStream(null);
    setRemoteStream(null);
    setInCall(false);
  };

  return (
    <div className="query-page-container">
      <div className="query-card">
        <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Live Classroom Chat</h2>

        {incomingCall && !inCall && (
          <div style={{ display: 'flex', gap: '15px', marginBottom: "20px" }}>
            <button
              onClick={handleAccept}
              className="btn-primary"
              style={{ backgroundColor: 'var(--secondary)' }}
            >
              Join Video Class
            </button>
          </div>
        )}

        {inCall && (
          <div style={{ display: 'flex', gap: '15px', marginBottom: "20px" }}>
            <button
              onClick={handleEnd}
              className="btn-primary"
              style={{ backgroundColor: 'var(--danger)' }}
            >
              Leave Class
            </button>
          </div>
        )}

        {inCall && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            {localStream && (
              <div>
                <h4 style={{marginBottom: '5px', fontSize: '14px', color: 'var(--text-color)'}}>You (Student)</h4>
                <VideoPlayer stream={localStream} isLocal={true} />
              </div>
            )}
            {remoteStream && (
              <div>
                <h4 style={{marginBottom: '5px', fontSize: '14px', color: 'var(--text-color)'}}>Teacher</h4>
                <VideoPlayer stream={remoteStream} isLocal={false} />
              </div>
            )}
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
              const isMe = msg.sender === userName;
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
