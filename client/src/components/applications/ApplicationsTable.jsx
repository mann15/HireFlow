import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchApplications } from "../../redux/thunks/applicationThunks";
import { setFilters } from "../../redux/applicationSlice";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const ApplicationsTable = ({ positionId = null }) => {
  const dispatch = useDispatch();
  const { applications, loading } = useSelector((state) => state.application);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    dispatch(fetchApplications({ positionId, status: filter }));
    dispatch(setFilters({ positionId, status: filter }));
  }, [dispatch, positionId, filter]);

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
              {applications.map((app, index) => (
                <tr
                  key={
                    app.id ||
                    `${app.positionId || "pos"}-${
                      app.candidateId || "cand"
                    }-${index}`
                  }
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{app.candidate.firstName}</p>
                      <p className="text-sm text-gray-500">
                        {app.candidate.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{app.position.jobTitle}</p>
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
                    {app.appliedAt
                      ? format(new Date(app.appliedAt), "PP")
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/applications/${app.applicationId}`}
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
