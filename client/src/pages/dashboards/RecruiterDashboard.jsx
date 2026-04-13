import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { positionService } from "../../services/apiService";
import { applicationService } from "../../services/apiService";
import { interviewService } from "../../services/apiService";
import {
  APPLICATION_STATUS,
  INTERVIEW_STATUS,
  POSITION_STATUS,
} from "../../utils/constants";

const RecruiterDashboard = () => {
  const [stats, setStats] = useState({
    activePositions: 0,
    pendingApplications: 0,
    scheduledInterviews: 0,
    recentPositions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const unwrapList = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.content)) return value.content;
    return [];
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [positionsResult, applicationsResult, interviewsResult] =
        await Promise.allSettled([
          positionService.getPositions(),
          applicationService.getApplications(),
          interviewService.getMyInterviews(),
        ]);

      const positions = unwrapList(
        positionsResult.status === "fulfilled" ? positionsResult.value : [],
      );
      const applications = unwrapList(
        applicationsResult.status === "fulfilled"
          ? applicationsResult.value
          : [],
      );
      const interviews = unwrapList(
        interviewsResult.status === "fulfilled" ? interviewsResult.value : [],
      );

      const openPositions = positions.filter(
        (position) => position?.status === POSITION_STATUS.OPEN,
      );
      const recentPositions = openPositions.slice(0, 5);
      const scheduledInterviews = interviews.filter(
        (interview) =>
          interview?.status === INTERVIEW_STATUS.SCHEDULED ||
          interview?.status === INTERVIEW_STATUS.RESCHEDULED,
      ).length;

      setStats({
        activePositions: openPositions.length,
        pendingApplications: applications.filter(
          (application) =>
            application?.status === APPLICATION_STATUS.APPLIED ||
            application?.status === APPLICATION_STATUS.SCREENING ||
            application?.status === "SCREENING_PENDING" ||
            application?.currentStage?.includes("SCREENING") ||
            application?.currentStage?.includes("REVIEW"),
        ).length,
        scheduledInterviews,
        recentPositions,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 mt-20">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Recruiter Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Manage positions, candidates, and interviews
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Active Positions
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.activePositions}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <Link
            to="/positions"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-4 inline-block"
          >
            View all positions →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Pending Applications
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.pendingApplications}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
          <Link
            to="/applications"
            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium mt-4 inline-block"
          >
            Review applications →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Scheduled Interviews
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.scheduledInterviews}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <Link
            to="/interviews/manage"
            className="text-green-600 hover:text-green-800 text-sm font-medium mt-4 inline-block"
          >
            Manage interviews →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/positions/new"
              className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-medium"
            >
              Create New Position
            </Link>
            <Link
              to="/candidates/new"
              className="block w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center font-medium"
            >
              Add Candidate
            </Link>
            <Link
              to="/candidates"
              className="block w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-center font-medium"
            >
              View All Candidates
            </Link>
          </div>
        </div>

        {/* Recent Positions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Positions
            </h2>
            <Link
              to="/positions"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all →
            </Link>
          </div>
          {stats.recentPositions.length > 0 ? (
            <div className="space-y-3">
              {stats.recentPositions.map((position) => (
                <Link
                  key={position.positionId || position.id}
                  to={`/positions/${position.positionId || position.id}`}
                  className="block p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <p className="font-medium text-gray-900">
                    {position.jobTitle}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {position.department}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No positions yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
