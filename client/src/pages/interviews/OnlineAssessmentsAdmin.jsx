import React, { useState } from "react";
import { Link } from "react-router-dom";

const OnlineAssessmentsAdmin = () => {
  const [assessments, setAssessments] = useState([
    { id: 1, title: "Frontend React Basic Skills", questionCount: 20, duration: 45, status: "Active" },
    { id: 2, title: "Backend Java Sprint Boot", questionCount: 15, duration: 60, status: "Active" },
    { id: 3, title: "General Cognitive & Logic", questionCount: 30, duration: 30, status: "Draft" }
  ]);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Online Examination Module</h2>
          <p className="text-gray-500 mt-1">Manage tests and assessments for pre-interview screening.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
          Create New Assessment
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6 flex items-start">
        <svg className="w-5 h-5 mr-3 mt-0.5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <div>
          <h4 className="font-semibold">Future Implementation Notice</h4>
          <p className="text-sm mt-1">This module is correctly wired into the Interview Scheduling process (via the "Pre-interview online test" flag), but the automated grading and test-taking UI is currently a placeholder pending integration with a testing vendor (e.g. HackerRank, Mettl) or completion of the internal test engine.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-700 font-semibold text-sm border-b border-gray-200">
              <th className="p-4">Assessment Name</th>
              <th className="p-4">Questions</th>
              <th className="p-4">Duration (Mins)</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {assessments.map(test => (
              <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{test.title}</td>
                <td className="p-4 text-gray-500">{test.questionCount}</td>
                <td className="p-4 text-gray-500">{test.duration}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${test.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {test.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-3">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">Edit Config</button>
                  <button className="text-gray-500 hover:text-gray-700 font-medium">Preview</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OnlineAssessmentsAdmin;
