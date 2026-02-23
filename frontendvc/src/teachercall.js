import { io } from "socket.io-client";

const socket = io("https://vcp-rs8t.onrender.com");

let peerConnection = null;
let localStream = null;
let currentStudentId = null;

export const startTeacherCall = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (!document.getElementById("local-video")) {
      const video = document.createElement("video");
      video.id = "local-video";
      video.srcObject = localStream;
      video.autoplay = true;
      video.muted = true;
      video.style.width = "400px";
      document.body.appendChild(video);
    }

    peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && currentStudentId) {
        socket.emit("ice-candidate", {
          target: currentStudentId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.ontrack = (event) => {
      if (!document.getElementById("remote-video")) {
        const remoteVideo = document.createElement("video");
        remoteVideo.id = "remote-video";
        remoteVideo.srcObject = event.streams[0];
        remoteVideo.autoplay = true;
        remoteVideo.style.width = "400px";
        document.body.appendChild(remoteVideo);
      }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit("offer", { offer });

    console.log("📞 Offer sent...");
  } catch (err) {
    console.error("Teacher error:", err);
  }
};

socket.on("answer", async (data) => {
  try {
    currentStudentId = data.studentId;

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.answer)
    );

    console.log("✅ Connected to student!");
  } catch (err) {
    console.error("Error setting remote description:", err);
  }
});

socket.on("ice-candidate", async (data) => {
  if (peerConnection && data.senderId === currentStudentId) {
    await peerConnection.addIceCandidate(
      new RTCIceCandidate(data.candidate)
    );
  }
});

export const endTeacherCall = () => {
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }

  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  currentStudentId = null;
  document.querySelectorAll("video").forEach((v) => v.remove());
};