const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const SECRET_KEY = "123";
const url = "mongodb+srv://as:Aman9264@cluster0.wjfb6ep.mongodb.net/?appName=Cluster0";

const client = new MongoClient(url);

async function connectDB() {
  try {
    await client.connect();
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Connection Failed", err);
  }
}
connectDB();

/* ---------------- SOCKET.IO ---------------- */

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  /* ---------------- CHAT FEATURE ---------------- */

  socket.on("sendMessage", (data) => {
    socket.broadcast.emit("receiveMessage", data);
  });

  /* ---------------- VIDEO CALL FEATURE ---------------- */

  // Teacher sends offer → broadcast to students
  socket.on("offer", (data) => {
    socket.broadcast.emit("offer", {
      teacherId: socket.id,
      offer: data.offer,
    });
  });

  // Student sends answer → only teacher receives
  socket.on("answer", (data) => {
    io.to(data.target).emit("answer", {
      studentId: socket.id,
      answer: data.answer,
    });
  });

  // ICE candidates → send to specific peer
  socket.on("ice-candidate", (data) => {
    io.to(data.target).emit("ice-candidate", {
      studentId: socket.id,
      candidate: data.candidate,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* ---------------- REST APIs ---------------- */

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const db = client.db("mernpro");

    const user = await db.collection("signupdata").findOne({
      username: username.trim(),
      password: password.trim(),
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ username: user.username }, SECRET_KEY);

    res.json({
      token1: token,
      username1: user.username,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const db = client.db("mernpro");

    await db.collection("signupdata").insertOne({
      username: username.trim(),
      password: password.trim(),
      email,
    });

    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: "Error signing up" });
  }
});

app.post("/verify-class", async (req, res) => {
  const { classId } = req.body;

  try {
    const db = client.db("mernpro");

    const classFound = await db
      .collection("classid")
      .findOne({ classId: classId.trim() });

    if (!classFound) {
      return res.status(404).json({
        status: "failed",
        message: "Invalid Class ID",
      });
    }

    const token = jwt.sign({}, SECRET_KEY);

    res.json({
      studentprogress: "successful",
      token3: token,
      status: "successful",
    });
  } catch (err) {
    res.status(500).json({ message: "Error verifying class" });
  }
});

app.post("/create-class", async (req, res) => {
  const { classId } = req.body;

  try {
    const db = client.db("mernpro");

    await db.collection("classid").insertOne({
      classId: classId.trim(),
    });

    const token = jwt.sign({}, SECRET_KEY);

    res.json({
      status: "successful",
      teacherprogress: "successful",
      token2: token,
    });
  } catch (err) {
    res.status(500).json({ status: "failed" });
  }
});

/* ---------------- START SERVER ---------------- */

server.listen(5000, () => {
  console.log("Server running on port 5000");
});