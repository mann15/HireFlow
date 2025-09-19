import React from "react";

const ReviewerDashboard = () => {
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Reviewer Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded">Pending Screenings</div>
        <div className="p-4 border rounded">Assigned Positions</div>
        <div className="p-4 border rounded">Review History</div>
      </div>
    </div>
  );
};

export default ReviewerDashboard;
