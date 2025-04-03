const express = require("express");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const MASTER_PORT = 3000;

const activeServers = [];
const MAX_USERS_PER_SERVER = 2;
let nextWorkerPort = MASTER_PORT + 1000; // Starts at 4000

// Initialize master server
activeServers.push({
  port: MASTER_PORT,
  userCount: 0,
  isMaster: true,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Register new workers
app.post("/register-worker", (req, res) => {
  const { port } = req.body;
  if (!activeServers.some((s) => s.port === port)) {
    activeServers.push({ port: Number(port), userCount: 0 });
    console.log(`Worker registered on port ${port}`);
  }
  res.sendStatus(200);
});

// Main assignment endpoint
app.get("/assign-server", (req, res) => {
  // Clean up empty workers (except master)
  activeServers.forEach((server, index) => {
    if (!server.isMaster && server.userCount === 0 && server.process) {
      server.process.kill();
      activeServers.splice(index, 1);
    }
  });

  // Find available server
  const availableServer =
    activeServers.find((s) => s.userCount < MAX_USERS_PER_SERVER) ||
    createNewWorker();

  availableServer.userCount++;
  logStats();

  // Redirect browsers, return JSON for API calls
  if (req.accepts("html")) {
    // Fixed: Added missing parenthesis
    if (availableServer.port !== MASTER_PORT) {
      return res.redirect(`http://localhost:${availableServer.port}`);
    }
    return res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  }

  res.json({ port: availableServer.port });
});

function createNewWorker() {
  const newPort = nextWorkerPort;
  nextWorkerPort += 1000;

  const worker = {
    port: newPort,
    userCount: 0,
    process: spawn("node", ["worker.js", newPort.toString()], {
      stdio: "inherit",
      detached: true,
      cwd: path.join(__dirname, ".."),
    }),
  };

  activeServers.push(worker);
  console.log(`Launched new worker on port ${newPort}`);
  return worker;
}

function logStats() {
  const stats = activeServers
    .map((s) => `Port ${s.port}: ${s.userCount}/${MAX_USERS_PER_SERVER} users`)
    .join("\n");
  console.log(`\n=== Current Load ===\n${stats}\n`);
}

// Fallback for frontend routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(MASTER_PORT, () => {
  console.log(`Master server running on http://localhost:${MASTER_PORT}`);
});
