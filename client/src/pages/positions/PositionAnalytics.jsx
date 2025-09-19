import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApplicationsByPosition } from "../../services/positionService";

const PositionAnalytics = () => {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    (async () => {
      const apps = await getApplicationsByPosition(id);
      setApplications(apps || []);
    })();
  }, [id]);

  const total = applications.length;
  const byStatus = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Position Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Total Applications</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">By Status</div>
          <div className="mt-2">
            {Object.entries(byStatus).length === 0 ? (
              <div className="text-gray-500">No data</div>
            ) : (
              Object.entries(byStatus).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <div className="capitalize">{k}</div>
                  <div>{v}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionAnalytics;
