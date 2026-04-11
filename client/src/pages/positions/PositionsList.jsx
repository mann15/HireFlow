import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPositions } from "../../redux/thunks/positionThunks";
import { setFilters } from "../../redux/positionSlice";
import PositionCard from "../../components/positions/PositionCard";
import { btnPrimaryMd } from "../../utils/buttonStyles";

const PositionsList = () => {
  const dispatch = useDispatch();
  const { positions, loading, error } = useSelector((state) => state.position);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchPositions());
  }, [dispatch]);

  const filtered = positions.filter((p) => {
    const matchesQuery =
      p.jobTitle?.toLowerCase().includes(query.toLowerCase()) ||
      (p.jobDescription || "").toLowerCase().includes(query.toLowerCase()) ||
      (p.department || "").toLowerCase().includes(query.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || p.status === statusFilter.toUpperCase();
    const matchesDepartment =
      departmentFilter === "all" || p.department === departmentFilter;
    return matchesQuery && matchesStatus && matchesDepartment;
  });

  const departments = [
    ...new Set(positions.map((p) => p.department).filter(Boolean)),
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6 mt-20">
        <div className="flex justify-center items-center h-64">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: "var(--primary-color)" }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Job Positions</h2>
            <p className="text-gray-600 mt-1">
              Manage and view all job positions
            </p>
          </div>
          <Link
            to="/positions/add"
            className={`inline-flex items-center ${btnPrimaryMd} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500`}
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Position
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Positions
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, description, or department"
                  className="w-full border border-gray-300 rounded-md shadow-sm pl-10 pr-4 py-2"
                  style={{
                    "--tw-ring-color": "var(--primary-color)",
                    borderColor: "var(--border-color, #d1d5db)",
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2"
                style={{
                  "--tw-ring-color": "var(--primary-color)",
                  borderColor: "var(--border-color, #d1d5db)",
                }}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="on_hold">On Hold</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2"
                style={{
                  "--tw-ring-color": "var(--primary-color)",
                  borderColor: "var(--border-color, #d1d5db)",
                }}
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filtered.length} of {positions.length} positions
          </p>
          <div className="flex space-x-2">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                positions.filter((p) => p.status === "OPEN").length > 0
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {positions.filter((p) => p.status === "OPEN").length} Open
            </span>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                positions.filter((p) => p.status === "ON_HOLD").length > 0
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {positions.filter((p) => p.status === "ON_HOLD").length} On Hold
            </span>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                positions.filter((p) => p.status === "CLOSED").length > 0
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {positions.filter((p) => p.status === "CLOSED").length} Closed
            </span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No positions found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {query || statusFilter !== "all" || departmentFilter !== "all"
                ? "Try adjusting your search criteria."
                : "Get started by creating a new position."}
            </p>
            {!query && statusFilter === "all" && departmentFilter === "all" && (
              <div className="mt-6">
                <Link
                  to="/positions/add"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ backgroundColor: "var(--primary-color)" }}
                >
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Position
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PositionCard key={p.positionId} position={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PositionsList;
