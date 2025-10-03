import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getPositionById,
  getApplicationsByPosition,
} from "../../services/positionService";

const PositionDetails = () => {
  const { id } = useParams();
  const [position, setPosition] = useState(null);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetch();
  }, [id]);

  const fetch = async () => {
    try {
      const pos = await getPositionById(id);
      setPosition(pos);
      const apps = await getApplicationsByPosition(id);
      setApplications(apps || []);
    } catch (err) {
      console.error(err);
    }
  };

  if (!position) return <div className="container p-6">Loading...</div>;

  return (
    <div className="container mx-auto p-6 mt-20">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold">{position.jobTitle}</h2>
          <p className="text-sm text-gray-600">
            Status: {position.status || "OPEN"}
          </p>
        </div>
        <div className="space-x-2">
          <Link
            to={`/positions/${position.positionId}/edit`}
            className="px-3 py-1 rounded bg-yellow-500 text-white"
          >
            Edit
          </Link>
          <Link
            to={`/positions/${position.positionId}/applications`}
            className="px-3 py-1 rounded bg-blue-600 text-white"
          >
            Applications ({applications.length})
          </Link>
          <Link
            to={`/positions/${position.positionId}/analytics`}
            className="px-3 py-1 rounded bg-green-600 text-white"
          >
            Analytics
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium">Description</h3>
        <p className="whitespace-pre-wrap">{position.description}</p>
      </div>

      <div>
        <h3 className="font-medium mb-2">Recent Applications</h3>
        {applications.length === 0 ? (
          <div className="text-gray-500">No applications yet.</div>
        ) : (
          <ul className="space-y-2">
            {applications.slice(0, 5).map((a) => (
              <li key={a.applicationId} className="border p-3 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">
                      {a.candidate?.firstName} {a.candidate?.lastName}
                    </div>
                    <div className="text-sm text-gray-600">{a.status}</div>
                  </div>
                  <span className="text-sm text-gray-500">
                    Application #{a.applicationId}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PositionDetails;
