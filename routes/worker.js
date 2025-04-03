const express = require("express");
const path = require("path");
const axios = require("axios");

const PORT = process.argv[2] || 4000;
const MASTER_URL = "http://localhost:3000";

const app = express();
let connectedUsers = 0;

// IMPORTANT: Get the CORRECT path to frontend files
const frontendDistPath = path.resolve(__dirname, "../frontend/dist");

// Verify the path exists
console.log(`[Worker ${PORT}] Serving frontend from: ${frontendDistPath}`);

// Middleware to track connections
app.use((req, res, next) => {
  // Skip for static files and health checks
  if (req.path.startsWith("/static") || req.path === "/health") {
    return next();
  }

  // Check server capacity
  if (connectedUsers >= 2) {
    return res.redirect(`${MASTER_URL}/assign-server`);
  }

  connectedUsers++;
  console.log(`[Worker ${PORT}] Connection + (${connectedUsers}/2 users)`);

  res.on("finish", () => {
    connectedUsers--;
    console.log(`[Worker ${PORT}] Connection - (${connectedUsers}/2 users)`);
    axios
      .post(`${MASTER_URL}/release-slot`, { port: PORT })
      .catch((err) =>
        console.error(`[Worker ${PORT}] Release error:`, err.message)
      );
  });

  next();
});

// Serve static files from absolute path
app.use(express.static(frontendDistPath));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    port: PORT,
    connections: connectedUsers,
  });
});

// SPA fallback route (must be last)
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "../../frontend/src/index.html"));
});

app.listen(PORT, () => {
  console.log(`[Worker] Server running on http://localhost:${PORT}`);
  // Register with master
  axios
    .post(`${MASTER_URL}/register-worker`, { port: PORT })
    .catch((err) => console.error("Registration failed:", err.message));
});
