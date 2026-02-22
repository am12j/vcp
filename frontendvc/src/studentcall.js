// studentcall.js
import { io } from "socket.io-client";

const socket = io("https://vcp-rs8t.onrender.com"); // same server
let pc;
let localStream;

export const startStudentCall = async () => {
  socket.on("offer", async ({ offer }) => {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const localVideo = document.createElement("video");
      localVideo.srcObject = localStream;
      localVideo.autoplay = true;
      localVideo.muted = true;
      document.body.appendChild(localVideo);

      pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

      pc.ontrack = (e) => {
        const remoteVideo = document.createElement("video");
        remoteVideo.srcObject = e.streams[0];
        remoteVideo.autoplay = true;
        document.body.appendChild(remoteVideo);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            target: "teacher",
            candidate: event.candidate,
          });
        }
      };

      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { studentId: socket.id, answer });
    } catch (err) {
      console.error("Student call error:", err);
    }
  });

  socket.on("ice-candidate", async ({ candidate }) => {
    if (pc) await pc.addIceCandidate(candidate);
  });
};

// End call function
export const endStudentCall = () => {
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }

  if (pc) {
    pc.close();
    pc = null;
  }

  document.querySelectorAll("video").forEach((v) => v.remove());

  socket.emit("end-call", { from: "student" });
};
