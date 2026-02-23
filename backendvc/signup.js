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

  /* -------- OFFER -------- */
  socket.on("offer", (data) => {
    socket.broadcast.emit("offer", {
      teacherId: socket.id,
      offer: data.offer,
    });
  });

  /* -------- ANSWER -------- */
  socket.on("answer", (data) => {
    io.to(data.target).emit("answer", {
      studentId: socket.id,
      answer: data.answer,
    });
  });

  /* -------- ICE -------- */
  socket.on("ice-candidate", (data) => {
    io.to(data.target).emit("ice-candidate", {
      senderId: socket.id,
      candidate: data.candidate,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* ---------------- START SERVER ---------------- */

server.listen(5000, () => {
  console.log("Server running on port 5000");
});