import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchApplicationById } from "../../redux/thunks/applicationThunks";
import CVReviewPanel from "../../components/review/CVReviewPanel";
import { FiArrowLeft } from "react-icons/fi";
import { showError } from "../../utils/toastUtils";

const ReviewerApplicationDetails = () => {
  const dispatch = useDispatch();
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { currentApplication, loading } = useSelector(
    (state) => state.application
  );

  useEffect(() => {
    if (applicationId && applicationId !== "undefined") {
      dispatch(fetchApplicationById(applicationId));
    }
  }, [dispatch, applicationId]);

  // Refresh helper used by child components
  const fetchApplication = async () => {
    if (!applicationId || applicationId === "undefined") {
      showError("Invalid application ID");
      return;
    }
    try {
      await dispatch(fetchApplicationById(applicationId)).unwrap();
    } catch (err) {
      showError("Failed to refresh application details");
    }
  };

  const application = currentApplication;

  if (loading || !application) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          {loading ? "Loading application details..." : "Application not found"}
        </div>
      </div>
    );
  }

  // Check if application is in screening status
  const isScreeningStatus =
    application.status === "SCREENING" ||
    application.status === "SCREENING_PENDING" ||
    application.currentStage?.includes("SCREENING");

  return (
    <div className="min-h-screen pt-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/review/screening")}
          className="mb-4 flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <FiArrowLeft className="mr-2" /> Back to Applications
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">Review Candidate</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Candidate</p>
              <p className="font-semibold text-lg">
                {application.candidate?.firstName}{" "}
                {application.candidate?.lastName}
              </p>
              <p className="text-sm text-gray-500">
                {application.candidate?.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Position</p>
              <p className="font-semibold text-lg">
                {application.position?.jobTitle}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  isScreeningStatus
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {application.status}
              </span>
            </div>
          </div>

          {!isScreeningStatus && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This application is not currently in
                screening status. You can view the CV but may not be able to
                submit feedback.
              </p>
            </div>
          )}
        </div>

        {/* CV Review Panel */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b px-6 py-4">
            <h2 className="text-xl font-bold">CV Review</h2>
            <p className="text-sm text-gray-600 mt-1">
              Review the candidate's CV and provide your feedback
            </p>
          </div>

          <div className="p-6">
            <CVReviewPanel
              applicationId={applicationId}
              onUpdate={fetchApplication}
            />
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center">
            <Link
              to="/review/screening"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to All Applications
            </Link>
            <Link
              to="/reviewer/dashboard"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Go to Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewerApplicationDetails;
