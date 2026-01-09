import React from "react";
import { Link } from "react-router-dom";

const InterviewerDashboard = () => {
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Interviewer Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded">Scheduled Interviews</div>
        <div className="p-4 border rounded flex items-center justify-between">
          <span>Pending Feedback</span>
          <Link
            to="/interviews/my"
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to My Interviews
          </Link>
        </div>
        <div className="p-4 border rounded">Interview History</div>
      </div>
    </div>
  );
};

export default InterviewerDashboard;
