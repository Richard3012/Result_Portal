import React, { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPort] = useState(window.location.port || "3000");

  useEffect(() => {
    const port = window.location.port || "3000";

    // Only do assignment if on master port
    if (port === "3000") {
      fetch("/assign-server")
        .then((res) => res.json())
        .then((data) => {
          if (data.port && data.port.toString() !== port) {
            window.location.href = `http://localhost:${data.port}`;
          }
        })
        .catch(console.error);
    }
  }, []);

  const handleLogin = (credentials) => {
    // Your login logic here
    console.log(`Logging in on port ${currentPort}`, credentials);
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="app-container">
        <div className="port-indicator">Connected to: Port {currentPort}</div>
        <LoginPage onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="port-indicator">Connected to: Port {currentPort}</div>
      {/* Your logged-in content here */}
    </div>
  );
}

export default App;