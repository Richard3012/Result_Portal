const express = require("express");
const path = require("path");
const axios = require("axios");

const PORT = process.argv[2] || 4000;
const MASTER_URL = "http://localhost:3000";
let connectedUsers = 0;

const app = express();

const frontendPath = path.resolve(__dirname, "../../frontend/dist");
console.log(`[Worker ${PORT}] Frontend path: ${frontendPath}`);

app.use((req, res, next) => {
  const isStatic =
    req.path.startsWith("/assets") ||
    req.path.endsWith(".js") ||
    req.path.endsWith(".css") ||
    req.path.endsWith(".map") ||
    req.path === "/favicon.ico" ||
    req.path === "/health";

  if (isStatic) return next();

  if (connectedUsers >= 2) {
    console.log(`[Worker ${PORT}] Redirecting to master (limit reached)`);
    return res.redirect(`${MASTER_URL}/assign-server`);
  }

  connectedUsers++;
  console.log(`[Worker ${PORT}] +1 User (${connectedUsers}/2)`);

  res.on("finish", () => {
    connectedUsers--;
    console.log(`[Worker ${PORT}] -1 User (${connectedUsers}/2)`);
    axios
      .post(`${MASTER_URL}/release-slot`, { port: PORT })
      .catch((err) =>
        console.error(`[Worker ${PORT}] Release failed:`, err.message)
      );
  });

  next();
});

app.use(express.static(frontendPath));

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(frontendPath, "favicon.ico"));
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", port: PORT, connections: connectedUsers });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🧑‍💼 Worker listening at http://localhost:${PORT}`);
  axios
    .post(`${MASTER_URL}/register-worker`, { port: PORT })
    .catch((err) =>
      console.error(`[Worker ${PORT}] Registration failed:`, err.message)
    );
});
