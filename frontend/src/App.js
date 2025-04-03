import React, { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPort] = useState(window.location.port || "3000");

  useEffect(() => {
    // Check if we need to assign a server
    if (window.location.pathname === "/assign-server") {
      window.location.href = `http://localhost:3000/assign-server`;
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