import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  applicationService,
  positionService,
  reviewService,
} from "../../services/apiService";
import Loader from "../../components/Loader";

const ReviewerDashboard = () => {
  const [stats, setStats] = useState({
    pendingScreenings: 0,
    assignedPositions: 0,
    completedReviews: 0,
    assignedApplications: 0,
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

      const [applications, positions, reviews] = await Promise.all([
        applicationService.getApplications().catch(() => []),
        positionService.getPositions().catch(() => []),
        reviewService.getReviews
          ? reviewService.getReviews().catch(() => [])
          : Promise.resolve([]),
      ]);

      setStats({
        pendingScreenings: Array.isArray(applications)
          ? applications.filter((a) => a.status === "SCREENING_PENDING").length
          : 0,
        assignedPositions: Array.isArray(positions)
          ? positions.filter((p) => p.status === "OPEN").length
          : 0,
        completedReviews: Array.isArray(reviews) ? reviews.length : 0,
        assignedApplications: Array.isArray(applications)
          ? applications.filter((a) => a.reviewerAssigned === true).length
          : 0,
      });
    } catch (err) {
      console.error("Failed to load reviewer dashboard data:", err);
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

        <h1 className="text-3xl font-bold mb-8">Reviewer Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Screenings</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.pendingScreenings}
                </p>
              </div>
              <div className="text-4xl text-blue-200">🔍</div>
            </div>
            <Link
              to="/review/screening"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Start Reviewing →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Assigned Applications</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.assignedApplications}
                </p>
              </div>
              <div className="text-4xl text-green-200">📝</div>
            </div>
            <Link
              to="/applications"
              className="mt-4 inline-block text-green-600 hover:text-green-800 font-medium text-sm"
            >
              View Details →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Assigned Positions</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.assignedPositions}
                </p>
              </div>
              <div className="text-4xl text-purple-200">💼</div>
            </div>
            <Link
              to="/positions"
              className="mt-4 inline-block text-purple-600 hover:text-purple-800 font-medium text-sm"
            >
              View Details →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed Reviews</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.completedReviews}
                </p>
              </div>
              <div className="text-4xl text-orange-200">✅</div>
            </div>
            <Link
              to="/applications"
              className="mt-4 inline-block text-orange-600 hover:text-orange-800 font-medium text-sm"
            >
              View History →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/review/screening"
              className="p-4 border rounded-lg hover:bg-blue-50 transition"
            >
              <p className="font-medium">Review Candidates</p>
              <p className="text-sm text-gray-500">
                Screen pending applications
              </p>
            </Link>
            <Link
              to="/applications"
              className="p-4 border rounded-lg hover:bg-green-50 transition"
            >
              <p className="font-medium">View Applications</p>
              <p className="text-sm text-gray-500">All assigned applications</p>
            </Link>
            <Link
              to="/candidates"
              className="p-4 border rounded-lg hover:bg-purple-50 transition"
            >
              <p className="font-medium">Candidate Pool</p>
              <p className="text-sm text-gray-500">Browse all candidates</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewerDashboard;
