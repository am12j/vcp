let peerConnections = {}; // Dictionary of RTCPeerConnections (studentId -> connection)
let localStream = null;

export const startTeacherCall = async (socket, onLocalStream, onRemoteStream) => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    
    // Pass local stream to React UI
    onLocalStream(localStream);

    // Tell everyone in the room that the teacher is ready for connections
    socket.emit("teacher-ready");

    // Listen for students requesting to join the call
    socket.on("student-joined", async (data) => {
      const studentId = data.studentId;
      console.log("Student joined:", studentId);
      
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnections[studentId] = pc;

      // Add teacher's local stream to the connection
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            target: studentId,
            candidate: event.candidate,
          });
        }
      };

      // Handle receiving the student's video stream
      pc.ontrack = (event) => {
        onRemoteStream(studentId, event.streams[0]);
      };

      // Create an offer specifically for this student
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("offer", { target: studentId, offer });
    });

    // Handle student's answer
    socket.on("answer", async (data) => {
      const pc = peerConnections[data.studentId];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        console.log("✅ Connected to student:", data.studentId);
      }
    });

    // Handle incoming ICE candidates from student
    socket.on("ice-candidate", async (data) => {
      const pc = peerConnections[data.senderId];
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

  } catch (err) {
    console.error("Teacher error:", err);
  }
};

export const endTeacherCall = (socket) => {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  
  // Close all connections
  Object.values(peerConnections).forEach(pc => pc.close());
  peerConnections = {};
  
  // Clean up socket listeners so they don't multiply on next call
  socket.off("student-joined");
  socket.off("answer");
  socket.off("ice-candidate");
  
  console.log("🛑 Teacher call ended");
};