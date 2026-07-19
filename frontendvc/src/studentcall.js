let pc = null;
let localStream = null;

export const startStudentCall = async (socket, teacherId, onLocalStream, onRemoteStream) => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    
    // Pass local stream to React UI
    onLocalStream(localStream);

    // Set up listeners BEFORE emitting join, so we don't miss the offer!
    socket.on("offer", async (data) => {
      // Validate it's from the actual teacher
      if (data.teacherId !== teacherId) return;

      pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            target: teacherId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        onRemoteStream(event.streams[0]);
      };

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer", { target: teacherId, answer });
      console.log("📞 Student answered the call");
    });

    socket.on("ice-candidate", async (data) => {
      if (pc && data.senderId === teacherId) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    // Tell the teacher we are ready to receive an offer
    socket.emit("student-joined", { target: teacherId });

  } catch (err) {
    console.error("Student call error:", err);
  }
};

export const endStudentCall = (socket) => {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  if (pc) {
    pc.close();
    pc = null;
  }
  
  socket.off("offer");
  socket.off("ice-candidate");
  
  console.log("🛑 Student call ended");
};