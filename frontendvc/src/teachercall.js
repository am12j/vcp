// teachercall.js
import { io } from "socket.io-client";

const socket = io("https://vcp-rs8t.onrender.com");
const peerConnections = {}; 
let localStream = null;

export const startTeacherCall = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    // Show teacher's own video
    const video = document.createElement("video");
    video.srcObject = localStream;
    video.autoplay = true;
    video.muted = true;
    video.style.width = "400px";
    video.id = "local-video";
    document.body.appendChild(video);

    // Create the connection and store it immediately
    // Use a generic key like 'broadcast' or handle per student
    const pc = new RTCPeerConnection({ 
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }] 
    });

    // 1. Add tracks to the connection
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    // 2. Handle ICE candidates (Essential for P2P)
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { candidate: event.candidate });
      }
    };

    // 3. Handle incoming student video
    pc.ontrack = (event) => {
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
    
    // Store this PC so we can use it when the answer arrives
    peerConnections["currentCall"] = pc; 

    socket.emit("offer", { offer });

    // REMOVED: tempConnection.close() -> NEVER close here!

  } catch (err) {
    console.error("Teacher call error:", err);
  }
};

// Handle the student's answer
socket.on("answer", async (data) => {
  const pc = peerConnections["currentCall"];
  if (pc) {
    await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    console.log("Connection Established!");
  }
});

// Handle incoming ICE candidates from student
socket.on("ice-candidate", async (data) => {
  const pc = peerConnections["currentCall"];
  if (pc && data.candidate) {
    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  }
});

export const endTeacherCall = () => {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }
  
  Object.keys(peerConnections).forEach((key) => {
    peerConnections[key].close();
    delete peerConnections[key];
  });

  document.querySelectorAll("video").forEach((v) => v.remove());
  socket.emit("end-call", { from: "teacher" });
};