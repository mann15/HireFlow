import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  documentService,
  offerService,
  applicationService,
  interviewService,
} from "../../services/apiService";
import { APPLICATION_STATUS, INTERVIEW_STATUS } from "../../utils/constants";
import Loader from "../../components/Loader";

const HRDashboard = () => {
  const [stats, setStats] = useState({
    pendingDocuments: 0,
    pendingOffers: 0,
    totalApplications: 0,
    scheduledInterviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError(null);

      const [
        documentsResult,
        offersResult,
        applicationsResult,
        interviewsResult,
      ] = await Promise.allSettled([
        documentService.getPendingDocuments(),
        offerService.getOffers(),
        applicationService.getApplications(),
        interviewService.getMyInterviews(),
      ]);

      const documents = unwrapList(
        documentsResult.status === "fulfilled" ? documentsResult.value : [],
      );
      const offers = unwrapList(
        offersResult.status === "fulfilled" ? offersResult.value : [],
      );
      const applications = unwrapList(
        applicationsResult.status === "fulfilled"
          ? applicationsResult.value
          : [],
      );
      const interviews = unwrapList(
        interviewsResult.status === "fulfilled" ? interviewsResult.value : [],
      );

      setStats({
        pendingDocuments: Array.isArray(documents)
          ? documents.filter((document) => document.status === "PENDING").length
          : 0,
        pendingOffers: Array.isArray(offers)
          ? offers.filter((offer) => offer.status === "PENDING").length
          : 0,
        totalApplications: applications.length,
        scheduledInterviews: interviews.filter(
          (interview) =>
            interview.status === INTERVIEW_STATUS.SCHEDULED ||
            interview.status === INTERVIEW_STATUS.RESCHEDULED,
        ).length,
      });
    } catch (err) {
      console.error("Failed to load HR dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="container mx-auto px-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <h1 className="text-3xl font-bold mb-8">HR Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Documents</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.pendingDocuments}
                </p>
              </div>
            </div>
            <Link
              to="/documents/verify"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              View Details →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Offers</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.pendingOffers}
                </p>
              </div>
            </div>
            <Link
              to="/offers"
              className="mt-4 inline-block text-green-600 hover:text-green-800 font-medium text-sm"
            >
              View Details →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Applications</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.totalApplications}
                </p>
              </div>
            </div>
            <Link
              to="/applications"
              className="mt-4 inline-block text-purple-600 hover:text-purple-800 font-medium text-sm"
            >
              View Details →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Scheduled Interviews</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.scheduledInterviews}
                </p>
              </div>
            </div>
            <Link
              to="/interviews/manage"
              className="mt-4 inline-block text-orange-600 hover:text-orange-800 font-medium text-sm"
            >
              View Details →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/interviews/manage"
              className="p-4 border rounded-lg hover:bg-blue-50 transition"
            >
              <p className="font-medium">Manage Interviews</p>
              <p className="text-sm text-gray-500">
                Schedule and track interviews
              </p>
            </Link>
            <Link
              to="/documents/verify"
              className="p-4 border rounded-lg hover:bg-green-50 transition"
            >
              <p className="font-medium">Verify Documents</p>
              <p className="text-sm text-gray-500">Review pending documents</p>
            </Link>
            <Link
              to="/offers"
              className="p-4 border rounded-lg hover:bg-purple-50 transition"
            >
              <p className="font-medium">Manage Offers</p>
              <p className="text-sm text-gray-500">Create and send offers</p>
            </Link>
            <Link
              to="/reports"
              className="p-4 border rounded-lg hover:bg-orange-50 transition"
            >
              <p className="font-medium">View Reports</p>
              <p className="text-sm text-gray-500">Hiring analytics</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
