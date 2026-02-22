// teachercall.js
import { io } from "socket.io-client";

const socket = io("https://vcp-rs8t.onrender.com"); // Same server
const peerConnections = {}; 

// Start teacher's video call
export const startTeacherCall = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    const video = document.createElement("video");
    video.srcObject = stream;
    video.autoplay = true;
    video.muted = true;
    video.style.width = "400px";
    document.body.appendChild(video);

    // Create a new connection for the teacher
    const tempConnection = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    stream.getTracks().forEach((track) => tempConnection.addTrack(track, stream));

    const offer = await tempConnection.createOffer();
    await tempConnection.setLocalDescription(offer);

    socket.emit("offer", { offer });

    tempConnection.close(); // Close immediately after sending the offer

  } catch (err) {
    console.error("Teacher call error:", err);
  }
};

// Handle the student's answer
socket.on("answer", async (data) => {
  const { studentId, answer } = data;

  if (!peerConnections[studentId]) {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    peerConnections[studentId] = pc;

    pc.ontrack = (event) => {
      const remoteVideo = document.createElement("video");
      remoteVideo.srcObject = event.streams[0];
      remoteVideo.autoplay = true;
      remoteVideo.style.width = "400px";
      document.body.appendChild(remoteVideo);
    };

    const localStream = document.querySelector("video").srcObject;
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { target: studentId, candidate: event.candidate });
      }
    };
  }

  const pc = peerConnections[studentId];
  await pc.setRemoteDescription(answer);
});

// ICE candidate handling
socket.on("ice-candidate", async (data) => {
  const { studentId, candidate } = data;
  const pc = peerConnections[studentId];
  if (pc) await pc.addIceCandidate(candidate);
});

// End the teacher's call
export const endTeacherCall = () => {
  // Close all peer connections and stop streams
  Object.keys(peerConnections).forEach((studentId) => {
    const pc = peerConnections[studentId];
    if (pc) {
      pc.getSenders().forEach((sender) => {
        if (sender.track) sender.track.stop();
      });
      pc.close();
      delete peerConnections[studentId];
    }
  });

  
  document.querySelectorAll("video").forEach((video) => video.remove());

  
  socket.emit("end-call", { from: "teacher" });
};
