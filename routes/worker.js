const express = require("express");
const path = require("path");
const axios = require("axios");

const PORT = process.argv[2];
const MASTER_URL = "http://localhost:3000";

const app = express();
let connectedUsers = 0;

app.use((req, res, next) => {
  if (req.url.startsWith("/static") || req.url === "/health") return;
  next();

  if (connectedUsers >= 2) {
    return;
    return res.redirect(`${MASTER_URL}/assign-server`);
  }

  connectedUsers++;
  console.log(`[Worker ${PORT}] New connection (${connectedUsers}/2 users)`);

  // Release slot when response completes
  res.on("finish", () => {
    connectedUsers--;
    axios
      .post(`${MASTER_URL}/release-slot`, { port: Number(PORT) })
      .catch((err) =>
        console.error(`[Worker ${PORT}] Release error:`, err.message)
      );
  });

  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.sendStatus(200);
});

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Main endpoint
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`[Worker] Server started on http://localhost:${PORT}`);
});
