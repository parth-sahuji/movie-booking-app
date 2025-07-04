require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Load from environment or use defaults
const PORT = process.env.PORT || 10000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://movie-booking-app-yosx.vercel.app";

// Enable CORS for both REST API and WebSocket
app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ["GET", "POST", "DELETE"],
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// In-memory storage of shows and seats
let shows = [
  {
    _id: "1",
    title: "Avengers",
    time: "6:00 PM",
    seats: Array.from({ length: 40 }, () => ({ booked: false }))
  }
];

app.use(express.json());

// GET all shows
app.get("/api/shows", (req, res) => {
  res.json(shows);
});

// POST a new show
app.post("/api/shows", (req, res) => {
  const { title, time } = req.body;
  if (!title || !time) {
    return res.status(400).json({ error: "Title and time are required" });
  }

  const newShow = {
    _id: String(Date.now()),
    title,
    time,
    seats: Array.from({ length: 40 }, () => ({ booked: false }))
  };

  shows.push(newShow);
  res.status(201).json(newShow);
});

// DELETE a show
app.delete("/api/shows/:id", (req, res) => {
  const { id } = req.params;
  const showExists = shows.find((s) => s._id === id);
  if (!showExists) {
    return res.status(404).json({ error: "Show not found" });
  }

  shows = shows.filter((s) => s._id !== id);
  res.status(204).send();
});

// WebSocket Events
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on("joinRoom", (showId) => {
    const show = shows.find((s) => s._id === showId);
    if (show) {
      socket.join(showId);
      io.to(showId).emit("seatUpdate", show.seats);
    }
  });

  socket.on("selectSeat", ({ showId, index }) => {
    const show = shows.find((s) => s._id === showId);
    if (!show) return;

    if (!show.seats[index].booked) {
      show.seats[index] = { booked: true };
      io.to(showId).emit("seatUpdate", show.seats);
      socket.emit("seatSelectResult", { success: true, index });
    } else {
      socket.emit("seatSelectResult", { success: false, message: "Seat already booked" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`🎬 Server running at http://localhost:${PORT}`);
});
