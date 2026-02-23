import { io } from "socket.io-client";

const socket = io("https://vcp-rs8t.onrender.com");

let pc = null;
let localStream = null;
let teacherId = null;

/* ---------------- START STUDENT CALL ---------------- */

export const startStudentCall = () => {
  // Listen for teacher offer
  socket.on("offer", async ({ offer, teacherId: tId }) => {
    try {
      teacherId = tId; // IMPORTANT

      // 1️⃣ Get camera + mic
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // 2️⃣ Show student video
      if (!document.getElementById("local-video")) {
        const localVideo = document.createElement("video");
        localVideo.id = "local-video";
        localVideo.srcObject = localStream;
        localVideo.autoplay = true;
        localVideo.muted = true;
        localVideo.style.width = "400px";
        document.body.appendChild(localVideo);
      }

      // 3️⃣ Create peer connection
      pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      // 4️⃣ Add tracks
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      // 5️⃣ Receive teacher video
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

      // 6️⃣ Send ICE to teacher
      pc.onicecandidate = (event) => {
        if (event.candidate && teacherId) {
          socket.emit("ice-candidate", {
            target: teacherId,
            candidate: event.candidate,
          });
        }
      };

      // 7️⃣ Set remote description (teacher offer)
      await pc.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      // 8️⃣ Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // 9️⃣ Send answer back to teacher
      socket.emit("answer", {
        target: teacherId,
        answer: answer,
      });

      console.log("📞 Student answered the call");

    } catch (err) {
      console.error("❌ Student call error:", err);
    }
  });

  /* ---------------- RECEIVE ICE ---------------- */

  socket.on("ice-candidate", async ({ senderId, candidate }) => {
    if (pc && senderId === teacherId) {
      try {
        await pc.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (err) {
        console.error("❌ Error adding ICE:", err);
      }
    }
  });
};

/* ---------------- END CALL ---------------- */

export const endStudentCall = () => {
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }

  if (pc) {
    pc.close();
    pc = null;
  }

  teacherId = null;

  document.querySelectorAll("video").forEach((v) => v.remove());

  socket.emit("end-call");

  console.log("🛑 Student call ended");
};