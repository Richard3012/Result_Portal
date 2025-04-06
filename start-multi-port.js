const { exec } = require("child_process");

const startPort = 4000;
const endPort = 9000;
let commands = [];

for (let port = startPort; port <= endPort; port++) {
  commands.push(`cross-env PORT=${port} vite --port ${port}`);
}

const fullCommand = `npx concurrently "${commands.join('" "')}"`;

exec(fullCommand, (err, stdout, stderr) => {
  if (err) {
    console.error(`Error starting servers: ${err.message}`);
    return;
  }
  console.log(stdout);
  if (stderr) console.error(stderr);
});