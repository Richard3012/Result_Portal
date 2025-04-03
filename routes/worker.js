const express = require("express");
const path = require("path");
const axios = require("axios");

const PORT = process.argv[2] || 4000;
const MASTER_URL = "http://localhost:3000";

const app = express();
let connectedUsers = 0;

// Connection tracking middleware
app.use((req, res, next) => {
  if (req.url.startsWith("/static") || req.url === "/health") return next();

  if (connectedUsers >= 2) {
    return res.redirect(`${MASTER_URL}/assign-server`);
  }

  connectedUsers++;
  console.log(`[Worker ${PORT}] New connection (${connectedUsers}/2 users)`);

  res.on("finish", () => {
    connectedUsers--;
    axios
      .post(`${MASTER_URL}/release-slot`, { port: PORT })
      .catch((err) =>
        console.error(`[Worker ${PORT}] Release error:`, err.message)
      );
  });

  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    port: PORT,
    connections: connectedUsers,
  });
});

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Worker server started on http://localhost:${PORT}`);
  // Register with master
  axios
    .post(`${MASTER_URL}/register-worker`, { port: PORT })
    .catch((err) => console.error("Worker registration failed:", err.message));
});
