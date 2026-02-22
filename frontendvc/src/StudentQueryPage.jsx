import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { startStudentCall, endStudentCall } from "./studentcall"; // import end call too

const socket = io("https://vcp-rs8t.onrender.com");

function StudentQueryPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [incomingCall, setIncomingCall] = useState(false); // incoming offer
  const [inCall, setInCall] = useState(false); // call started
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("receiveMessage", (data) =>
      setMessages((prev) => [...prev, data])
    );

    socket.on("offer", () => {
      setIncomingCall(true); // show Accept and End buttons
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("offer");
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const messageData = { sender: "Student", text: query };
    socket.emit("sendMessage", messageData);
    setMessages((prev) => [...prev, messageData]);
    setQuery("");
  };

  const handleLogout = () => {
    socket.disconnect();
    navigate("/login");
  };

  const handleAccept = () => {
    startStudentCall();
    setInCall(true);
  };

  const handleEnd = () => {
    endStudentCall();
    setInCall(false);
    setIncomingCall(false); // hide buttons if desired
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "12px", width: "420px" }}>
        <button
          onClick={handleLogout}
          style={{
            marginBottom: "10px",
            padding: "6px 12px",
            backgroundColor: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>

        <h2>Student Queries</h2>

        {incomingCall && (
          <div style={{ marginBottom: "15px" }}>
            <button
              onClick={handleAccept}
              disabled={inCall}
              style={{
                width: "48%",
                padding: "12px",
                backgroundColor: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: inCall ? "not-allowed" : "pointer",
                marginRight: "4%",
              }}
            >
              Accept Video Call
            </button>

            <button
              onClick={handleEnd}
              style={{
                width: "48%",
                padding: "12px",
                backgroundColor: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              End Call
            </button>
          </div>
        )}

        <div
          style={{
            height: "200px",
            overflowY: "auto",
            padding: "12px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            marginBottom: "15px",
            backgroundColor: "#f1f5f9",
          }}
        >
          {messages.map((msg, i) => (
            <p key={i}>
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
            style={{
              width: "100%",
              height: "80px",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "15px",
              marginBottom: "15px",
            }}
          />
          <input
            type="submit"
            value="Send"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#0f766e",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          />
        </form>
      </div>
    </div>
  );
}

export default StudentQueryPage;
