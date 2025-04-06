const { exec } = require("child_process");

// Configuration
const basePort = 3000;
const maxPorts = 9000;
const maxUsersPerPort = 2;

// Track active ports and their user counts
const activePorts = new Map();

// Function to start a new server on the specified port
function startServer(port) {
  if (port > maxPorts) {
    console.log("Maximum port limit reached. Cannot start a new server.");
    return;
  }

  console.log(`Starting server on port ${port}...`);
  const serverProcess = exec(
    `cross-env PORT=${port} npm run dev`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(
          `Error starting server on port ${port}: ${error.message}`
        );
        return;
      }
      if (stderr) {
        console.error(`Server on port ${port} stderr: ${stderr}`);
        return;
      }
      console.log(`Server on port ${port} started successfully.`);
    }
  );

  // Track the new server's user count
  activePorts.set(port, { users: 0, process: serverProcess });
}

// Function to assign a user to an available port
function assignUserToPort() {
  for (const [port, info] of activePorts) {
    if (info.users < maxUsersPerPort) {
      info.users += 1;
      console.log(
        `Assigned user to port ${port}. Current load: ${info.users}/${maxUsersPerPort} users.`
      );
      return port;
    }
  }

  // No available port found; start a new server
  const newPort = basePort + activePorts.size * 1000;
  startServer(newPort);
  activePorts.get(newPort).users = 1;
  console.log(
    `Assigned user to new port ${newPort}. Current load: 1/${maxUsersPerPort} users.`
  );
  return newPort;
}

// Initialize the first server
startServer(basePort);

// Simulate user connections
setInterval(() => {
  assignUserToPort();
}, 5000); // Adjust the interval as needed

