const express = require("express");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const MASTER_PORT = 3000;

const activeServers = [];
const MAX_USERS_PER_SERVER = 2;
let nextWorkerPort = 4000;

const activeConnections = new Map();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Assign server endpoint
app.get("/assign-server", (req, res) => {
  // Clean up disconnected servers first
  activeServers.forEach((server) => {
    if (server.userCount === 0 && server.port !== MASTER_PORT) {
      console.log(`Closing unused worker on port ${server.port}`);
      server.process.kill();
      activeServers.splice(activeServers.indexOf(server), 1);
    }
  });

  const availableServer = activeServers.find(
    (s) => s.userCount < MAX_USERS_PER_SERVER
  );

  if (availableServer) {
    availableServer.userCount++;
    const connectionID = Date.now();
    activeConnections.set(connectionID, availableServer.port);

    console.log(
      `Assigning to port ${availableServer.port} (${availableServer.userCount} users)`
    );
    return res.json({ port: availableServer.port });
  }

  // Launch new worker on next available port
  const newPort = nextWorkerPort;
  nextWorkerPort += 1000; // Increment for next worker (4000, 5000, etc.)

  const workerProcess = spawn("node", ["../worker.js", newPort.toString()], {
    stdio: "inherit",
    detached: true,
  });

  const connectionID = Date.now();
  activeConnections.set(connectionID, newPort);

  activeServers.push({
    port: newPort,
    userCount: 1,
    process: workerProcess,
  });

  console.log(`Launched new worker on port ${newPort}`);
  res.json({ port: newPort, connectionID });
});

// Release endpoint
app.post("/release-slot/:connectionId", (req, res) => {
  const connectionID = req.params.connectionId;
  const port = activeConnections.get(connectionID);

  if (port) {
    const server = activeServers.find((s) => s.port === port);
    if (server) {
      server.userCount = Math.max(0, server.userCount - 1);
      console.log(`Released slot on ${port} (now ${server.userCount} users)`);

      activeConnections.delete(connectionID);
    }
    res.sendStatus(200);
  }
});

//Heartbeat Endpo
app.post("/heartbeat/:connectionId", (req, res) => {
  const connectionId = req.params.connectionId;
  if (activeConnections.has(connectionId)) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Fallback to frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(MASTER_PORT, () => {
  console.log(`Master controller running on http://localhost:${MASTER_PORT}`);
  activeServers.push({
    port: MASTER_PORT,
    userCount: 0,
    process: { kill: () => {} },
  });
});