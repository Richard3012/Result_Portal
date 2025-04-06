import React, { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import ResultPage from "./components/ResultPage"; // import it here

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPort] = useState(window.location.port || "3000");
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    const port = window.location.port || "3000";

    if (port === "3000") {
      fetch("/assign-server")
        .then((res) => res.json())
        .then((data) => {
          if (data.port && data.port.toString() !== port) {
            console.log(`Redirecting to worker on port ${data.port}`);
            window.location.href = `http://localhost:${data.port}`;
          }
        })
        .catch(console.error);
    }
  }, []);

  const handleLogin = (credentials) => {
    console.log(`Logging in on port ${currentPort}`, credentials);

    // Simulate fetch to backend and get student data
    // Replace with real API call
    if (
      credentials.username === "Richard" &&
      credentials.password === "pass"
    ) {
      const mockStudentData = {
        name: "Richard Dsouza",
        rollNumber: "A192",
        class: "6th Semester",
        results: {
          Distributed_Computing: 100,
          Interpersonal_Skills: 72,
          Machine_Learning: 78,
          Algorithmic_Trading: 85,
        },  
      };
      setStudentData(mockStudentData);
      setIsLoggedIn(true);
    }
    else if (
      credentials.username === "Ashok" &&
      credentials.password === "pass"
    ) {
      const mockStudentData = {
        name: "Ashok Thaniyath",
        rollNumber: "A194",
        class: "6th Semester",
        results: {
          Idli: 90,
          Dossa: 92,
          Sambhar: 78,
          Chutney: 88,
        },
      };
      setStudentData(mockStudentData);
      setIsLoggedIn(true);
    }  
    else {
      alert("Invalid credentials!");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setStudentData(null);
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
      <ResultPage studentData={studentData} onLogout={handleLogout} />
    </div>
  );
}

export default App;
