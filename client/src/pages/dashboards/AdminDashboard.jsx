import React from "react";

const AdminDashboard = () => {
  return (
    <div className="container mx-auto p-6 mt-20">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded">System Overview (KPIs, health)</div>
        <div className="p-4 border rounded">
          User Management (links to users)
        </div>
        <div className="p-4 border rounded">
          Analytics (system-wide reports)
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
