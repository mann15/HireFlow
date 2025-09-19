import React from "react";

const HRDashboard = () => {
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">HR Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded">Document Verifications</div>
        <div className="p-4 border rounded">Offers</div>
        <div className="p-4 border rounded">Onboarding</div>
      </div>
    </div>
  );
};

export default HRDashboard;
