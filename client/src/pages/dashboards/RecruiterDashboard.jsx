import React from "react";

const RecruiterDashboard = () => {
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Recruiter Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded">Active Positions</div>
        <div className="p-4 border rounded">Pending Applications</div>
        <div className="p-4 border rounded">Interview Schedules</div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
