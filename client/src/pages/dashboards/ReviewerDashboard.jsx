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
            </div>
            {/* <Link
              to="/applications"
              className="mt-4 inline-block text-orange-600 hover:text-orange-800 font-medium text-sm"
            >
              View History →
            </Link> */}
          </div>
        </div>

        {/* Task Center */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h2 className="text-xl font-bold flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              My Task Center
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-3">Action Required: Pending Screenings</h3>
              {stats.pendingScreenings > 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-red-800">You have {stats.pendingScreenings} candidate(s) waiting for screening review.</h4>
                    <p className="text-sm text-red-600 mt-1">Reviewing these promptly ensures a smooth hiring pipeline.</p>
                  </div>
                  <Link
                    to="/review/screening"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition shadow-sm whitespace-nowrap"
                  >
                    Start Screening
                  </Link>
                </div>
              ) : (
                <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-lg border border-green-200 text-sm">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  All caught up! No pending screenings required.
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Ongoing Applications</h3>
              {stats.assignedApplications > 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-blue-800">You are tracking {stats.assignedApplications} active application(s).</h4>
                  </div>
                  <Link
                    to="/applications"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition shadow-sm whitespace-nowrap"
                  >
                    View All
                  </Link>
                </div>
              ) : (
                <div className="flex items-center text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                  You do not have any active applications assigned to you right now.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewerDashboard;
