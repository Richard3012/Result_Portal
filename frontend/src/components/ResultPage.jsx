import React from 'react';
import { LogOut, Award, BookOpen } from 'lucide-react';

function ResultPage({ studentData, onLogout }) {
  if (!studentData) return null;

  const totalMarks = Object.values(studentData.results).reduce((a, b) => a + b, 0);
  const percentage = (totalMarks / (Object.keys(studentData.results).length * 100)) * 100;
  const grade = percentage >= 90 ? 'A+' : 
                percentage >= 80 ? 'A' : 
                percentage >= 70 ? 'B' : 
                percentage >= 60 ? 'C' : 'D';

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">Result Declaration</h1>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Student Details</h2>
              <div className="mt-4 space-y-2">
                <p className="text-gray-600">Name: <span className="font-medium text-gray-800">{studentData.name}</span></p>
                <p className="text-gray-600">Roll Number: <span className="font-medium text-gray-800">{studentData.rollNumber}</span></p>
                <p className="text-gray-600">Class: <span className="font-medium text-gray-800">{studentData.class}</span></p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <Award className="h-16 w-16 text-indigo-600 mx-auto mb-2" />
                <p className="text-xl font-bold text-gray-800">Grade: {grade}</p>
                <p className="text-gray-600">Percentage: {percentage.toFixed(2)}%</p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-700 mb-4">Subject Wise Results</h3>
          <div className="space-y-4">
            {Object.entries(studentData.results).map(([subject, marks]) => (
              <div key={subject} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">{subject}</span>
                  <span className="text-gray-800">{marks}/100</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${marks}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultPage;