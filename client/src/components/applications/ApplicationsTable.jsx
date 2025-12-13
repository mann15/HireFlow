import { useState, useEffect } from "react";
import {
  getAllApplications,
  getApplicationsByPosition,
} from "../../services/applicationService";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const ApplicationsTable = ({ positionId = null }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchApplications();
  }, [positionId, filter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let data;
      if (positionId) {
        data = await getApplicationsByPosition(positionId);
      } else {
        data = await getAllApplications();
      }

      // Apply filter
      if (filter !== "ALL") {
        data = data.filter((app) => app.status === filter);
      }

      setApplications(data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      APPLIED: "bg-blue-100 text-blue-800",
      SCREENING: "bg-purple-100 text-purple-800",
      INTERVIEW: "bg-yellow-100 text-yellow-800",
      SELECTED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      ON_HOLD: "bg-gray-100 text-gray-800",
      WITHDRAWN: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="text-center py-8">Loading applications...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold">Applications</h2>
        <div>
          <label className="mr-2 text-sm text-gray-600">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="ALL">All</option>
            <option value="APPLIED">Applied</option>
            <option value="SCREENING">Screening</option>
            <option value="INTERVIEW">Interview</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No applications found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Candidate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stage
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Applied Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{app.candidateName}</p>
                      <p className="text-sm text-gray-500">
                        {app.candidateEmail}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{app.positionTitle}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{app.currentStage}</td>
                  <td className="px-4 py-3 text-sm">
                    {app.appliedDate
                      ? format(new Date(app.appliedDate), "PP")
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/applications/${app.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicationsTable;
