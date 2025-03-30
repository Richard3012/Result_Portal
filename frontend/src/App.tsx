import React, { useState } from 'react';
import { LogIn, GraduationCap } from 'lucide-react';
import LoginPage from './components/LoginPage';
import ResultPage from './components/ResultPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentData, setStudentData] = useState(null);

  // Simulated student data - in a real app, this would come from a backend
  const mockStudentData = {
    name: "John Doe",
    rollNumber: "2024001",
    class: "XII-A",
    results: {
      Mathematics: 95,
      Physics: 88,
      Chemistry: 92,
      English: 85,
      ComputerScience: 98
    }
  };

  const handleLogin = (credentials: { username: string; password: string }) => {
    // Simulate authentication - in a real app, this would be an API call
    if (credentials.username === "student" && credentials.password === "password") {
      setIsLoggedIn(true);
      setStudentData(mockStudentData);
    } else {
      alert("Invalid credentials! Please try again.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setStudentData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <ResultPage studentData={studentData} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;