const express = require("express");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const PORT = 4000;

const activeServers = [];
const MAX_USERS_PER_SERVER = 2;

app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("/assign-server", (req, res) => {
  for (const server of activeServers) {
    if (server.userCount < MAX_USERS_PER_SERVER) {
      server.userCount++;
      return res.json({ port: server.port });
    }
  }
  const newPort = 3000 + activeServers.length * 1000;
  const workerProcess = spawn("node", ["worker.js", newPort], {
    stdio: "inherit",
    detached: true,
  });
  activeServers.push({
    port: newPort,
    userCount: 1,
    process: workerProcess,
  });
  res.json({ port: newPort });
});
app.post("/release-slot", (req, res) => {
  const port = req.body.port;
  const server = activeServers.find((s) => s.port === port);

  if (server) {
    server.userCount = Math.max(0, server.userCount - 1);
  }

  res.sendStatus(200);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Master controller running on http://localhost ${PORT}`);
  console.log(`Workers will autostart when users connect`);
});
