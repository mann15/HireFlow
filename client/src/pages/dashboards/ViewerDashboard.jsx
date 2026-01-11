import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  positionService,
  applicationService,
  reportService,
} from "../../services/apiService";
import Loader from "../../components/Loader";

const ViewerDashboard = () => {
  const [stats, setStats] = useState({
    totalPositions: 0,
    openPositions: 0,
    totalApplications: 0,
    totalCandidates: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [positions, applications] = await Promise.all([
        positionService.getPositions().catch(() => []),
        applicationService.getApplications().catch(() => []),
      ]);

      setStats({
        totalPositions: Array.isArray(positions) ? positions.length : 0,
        openPositions: Array.isArray(positions)
          ? positions.filter((p) => p.status === "OPEN").length
          : 0,
        totalApplications: Array.isArray(applications)
          ? applications.length
          : 0,
        totalCandidates: Array.isArray(applications)
          ? new Set(applications.map((a) => a.candidateId)).size
          : 0,
      });
    } catch (err) {
      console.error("Failed to load viewer dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="container mx-auto px-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <h1 className="text-3xl font-bold mb-8">Viewer Dashboard</h1>
        <p className="text-gray-600 mb-8">
          Read-only overview of recruitment analytics and insights
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Positions</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalPositions}
                </p>
              </div>
              <div className="text-4xl text-blue-200">💼</div>
            </div>
            <Link
              to="/positions"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              View Positions →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Open Positions</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.openPositions}
                </p>
              </div>
              <div className="text-4xl text-green-200">🔓</div>
            </div>
            <Link
              to="/positions"
              className="mt-4 inline-block text-green-600 hover:text-green-800 font-medium text-sm"
            >
              View Details →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Applications</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.totalApplications}
                </p>
              </div>
              <div className="text-4xl text-purple-200">📋</div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Total applications received
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Candidates</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.totalCandidates}
                </p>
              </div>
              <div className="text-4xl text-orange-200">👥</div>
            </div>
            <Link
              to="/candidates"
              className="mt-4 inline-block text-orange-600 hover:text-orange-800 font-medium text-sm"
            >
              View Candidates →
            </Link>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">About This Dashboard</h2>
            <p className="text-gray-600 mb-4">
              This is a read-only viewer dashboard designed to provide you with
              comprehensive insights into the recruitment process without
              editing capabilities.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>✓ View all open and closed positions</li>
              <li>✓ Monitor application statistics</li>
              <li>✓ Track candidate pool metrics</li>
              <li>✓ Access recruitment reports and analytics</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Available Views</h2>
            <div className="space-y-3">
              <Link
                to="/positions"
                className="block p-3 border rounded hover:bg-blue-50 transition"
              >
                <p className="font-medium text-blue-600">Positions</p>
                <p className="text-sm text-gray-500">Browse all job openings</p>
              </Link>
              <Link
                to="/candidates"
                className="block p-3 border rounded hover:bg-green-50 transition"
              >
                <p className="font-medium text-green-600">Candidates</p>
                <p className="text-sm text-gray-500">
                  View candidate information
                </p>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/positions"
              className="p-4 border rounded-lg hover:bg-blue-50 transition"
            >
              <p className="font-medium">All Positions</p>
              <p className="text-sm text-gray-500">View all positions</p>
            </Link>
            <Link
              to="/candidates"
              className="p-4 border rounded-lg hover:bg-green-50 transition"
            >
              <p className="font-medium">All Candidates</p>
              <p className="text-sm text-gray-500">View all candidates</p>
            </Link>
            <div className="p-4 border rounded-lg bg-gray-50 cursor-not-allowed opacity-50">
              <p className="font-medium">Reports</p>
              <p className="text-sm text-gray-500">Analytics (coming soon)</p>
            </div>
            <div className="p-4 border rounded-lg bg-gray-50 cursor-not-allowed opacity-50">
              <p className="font-medium">Settings</p>
              <p className="text-sm text-gray-500">View only (no edit)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewerDashboard;
