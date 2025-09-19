import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApplicationsByPosition } from "../../services/positionService";

const PositionApplications = () => {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    (async () => {
      const apps = await getApplicationsByPosition(id);
      setApplications(apps || []);
    })();
  }, [id]);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Applications for Position</h2>
      {applications.length === 0 ? (
        <div className="text-gray-500">No applications found.</div>
      ) : (
        <ul className="space-y-3">
          {applications.map((a) => (
            <li key={a.applicationId} className="border p-3 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">
                    {a.candidate?.firstName} {a.candidate?.lastName}
                  </div>
                  <div className="text-sm text-gray-600">{a.status}</div>
                </div>
                <div className="text-sm text-gray-500">
                  Submitted:{" "}
                  {a.appliedAt
                    ? new Date(a.appliedAt).toLocaleDateString()
                    : "-"}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PositionApplications;
