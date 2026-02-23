// teachercall.js
import { io } from "socket.io-client";

const socket = io("https://vcp-rs8t.onrender.com");
const peerConnections = {}; 
let localStream = null;

export const startTeacherCall = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    // Show teacher's own video
    if (!document.getElementById("local-video")) {
      const video = document.createElement("video");
      video.srcObject = localStream;
      video.autoplay = true;
      video.muted = true;
      video.style.width = "400px";
      video.id = "local-video";
      document.body.appendChild(video);
    }

    const pc = new RTCPeerConnection({ 
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }] 
    });

    // 1. Add tracks (Talker side)
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    // 2. Outgoing ICE candidates (Sending your address)
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("📡 Sending ICE candidate to backend...");
        socket.emit("ice-candidate", { candidate: event.candidate });
      }
    };

    // 3. Incoming Tracks (Listener side - Student's video)
    pc.ontrack = (event) => {
      console.log("🎥 Student video track received!");
      if (!document.getElementById("remote-video")) {
        const remoteVideo = document.createElement("video");
        remoteVideo.id = "remote-video";
        remoteVideo.srcObject = event.streams[0];
        remoteVideo.autoplay = true;
        remoteVideo.style.width = "400px";
        document.body.appendChild(remoteVideo);
      }
    };

    // 4. Create and Send Offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    peerConnections["currentCall"] = pc; 
    socket.emit("offer", { offer });

    console.log("📞 Offer sent. Waiting for student to accept...");

  } catch (err) {
    console.error("❌ Teacher call error:", err);
  }
};

/* --- SIGNALING LISTENERS --- */

// Handle the student's answer
socket.on("answer", async (data) => {
  const pc = peerConnections["currentCall"];
  if (pc) {
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      console.log("✅ WebRTC Handshake Complete: Connection Established!");
    } catch (e) {
      console.error("❌ Error setting remote description:", e);
    }
  }
});

// Incoming ICE candidates (Receiving student's address)
socket.on("ice-candidate", async (data) => {
  const pc = peerConnections["currentCall"];
  if (pc && data.candidate) {
    try {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      console.log("✅ Student's network path added!");
    } catch (e) {
      console.error("❌ Error adding ICE candidate:", e);
    }
  }
});

export const endTeacherCall = () => {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  
  if (peerConnections["currentCall"]) {
    peerConnections["currentCall"].close();
    delete peerConnections["currentCall"];
  }

  document.querySelectorAll("video").forEach((v) => v.remove());
  socket.emit("end-call", { from: "teacher" });
  console.log("🛑 Call ended.");
};