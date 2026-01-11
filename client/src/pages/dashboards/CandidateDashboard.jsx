import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaBriefcase,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaSpinner,
  FaUpload,
  FaEye,
  FaDownload,
  FaTrash,
} from "react-icons/fa";
import api from "../../api/axios";
import CandidateCVUpload from "../../components/candidates/CandidateCVUpload";
import AddSkillsModal from "../../components/candidates/AddSkillsModal";
import { candidateService } from "../../services/candidateService";
import {
  getMyOffers,
  acceptOffer,
  rejectOffer,
} from "../../services/offerService";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import {
  getErrorMessage,
  showError,
  showSuccess,
  showWarning,
} from "../../utils/toastUtils";

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [applications, setApplications] = useState([]);
  const [availablePositions, setAvailablePositions] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [offers, setOffers] = useState([]);
  const [offerActionLoading, setOfferActionLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState({
    open: false,
    offerId: null,
  });
  const [rejectReason, setRejectReason] = useState("");
  const [cvs, setCvs] = useState([]);
  const [showCVUpload, setShowCVUpload] = useState(false);
  const [showAddSkills, setShowAddSkills] = useState(false);
  const [cvLoading, setCvLoading] = useState(false);
  const [candidateSkills, setCandidateSkills] = useState([]);

  useEffect(() => {
    fetchCandidateData();
  }, []);

  const fetchCandidateData = async () => {
    try {
      setLoading(true);

      // Fetch candidate profile
      const profileRes = await api.get("/candidates/me");
      setCandidate(profileRes.data.candidate);
      const candidateId = profileRes.data.candidate?.candidateId;

      // Fetch applications
      const applicationsRes = await api.get("/candidates/me/applications");
      setApplications(applicationsRes.data || []);

      // Fetch available positions
      const positionsRes = await api.get("/candidates/me/available-positions");
      setAvailablePositions(positionsRes.data.positions || []);

      // Fetch candidate skills - use /me endpoint for current candidate
      try {
        let skillsRes = await candidateService.getCandidateSkills();
        // Handle different response formats
        if (Array.isArray(skillsRes)) {
          setCandidateSkills(skillsRes);
        } else if (skillsRes?.data && Array.isArray(skillsRes.data)) {
          setCandidateSkills(skillsRes.data);
        } else if (skillsRes?.skills && Array.isArray(skillsRes.skills)) {
          setCandidateSkills(skillsRes.skills);
        } else {
          setCandidateSkills([]);
        }
      } catch (err) {
        console.error("Error fetching candidate skills:", err);
        setCandidateSkills([]);
      }

      // Fetch my offers
      const offersRes = await getMyOffers();
      setOffers(offersRes || []);

      // Fetch CVs
      try {
        const cvsRes = await candidateService.getCandidateCVs();
        setCvs(Array.isArray(cvsRes) ? cvsRes : []);
      } catch (err) {
        console.error("Error fetching CVs:", err);
        setCvs([]);
      }
    } catch (error) {
      console.error("Error fetching candidate data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPLIED":
        return "bg-blue-100 text-blue-800";
      case "SCREENING":
        return "bg-purple-100 text-purple-800";
      case "INTERVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "SELECTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "ON_HOLD":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStageLabel = (stage) => {
    if (!stage) return "Not Started";
    const labels = {
      APPLIED: "Application Submitted",
      UNDER_SCREENING: "CV Under Review",
      PENDING_INTERVIEW: "Interview Scheduled",
      SELECTED: "Selected",
      REJECTED: "Rejected",
      ON_HOLD: "On Hold",
      WITHDRAWN: "Withdrawn",
    };
    return labels[stage] || stage;
  };

  // Check if upload documents should be shown (only for SELECTED status)
  const canUploadDocuments = (status) => {
    return status === "SELECTED" || status === "HIRED";
  };

  const getOfferStatusColor = (status) => {
    switch (status) {
      case "GENERATED":
        return "bg-gray-100 text-gray-800";
      case "SEND":
        return "bg-blue-100 text-blue-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "WITHDRAWN":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString() : "-";

  const handleAcceptOffer = async (offerId) => {
    try {
      setOfferActionLoading(true);
      await acceptOffer(offerId);
      await fetchCandidateData();
      showSuccess("Offer accepted successfully");
    } catch (error) {
      showError(getErrorMessage(error, "Failed to accept offer"));
    } finally {
      setOfferActionLoading(false);
    }
  };

  const handleRejectOffer = async (offerId) => {
    setRejectModal({ open: true, offerId });
  };

  const confirmRejectOffer = async () => {
    if (!rejectReason.trim()) {
      showWarning("Please provide a reason for rejection");
      return;
    }

    try {
      setOfferActionLoading(true);
      await rejectOffer(rejectModal.offerId, rejectReason.trim());
      await fetchCandidateData();
      showSuccess("Offer rejected");
    } catch (error) {
      showError(getErrorMessage(error, "Failed to reject offer"));
    } finally {
      setOfferActionLoading(false);
      setRejectModal({ open: false, offerId: null });
      setRejectReason("");
    }
  };

  const handleApplyToPosition = async (positionId) => {
    if (!candidate) return;

    try {
      const latestCvId = cvs && cvs.length > 0 ? cvs[0].cvId : null;
      await api.post(`/candidates/${candidate.candidateId}/apply`, {
        positionId,
        cvId: latestCvId,
      });
      showSuccess("Application submitted successfully!");
      fetchCandidateData(); // Refresh data
    } catch (error) {
      showError(getErrorMessage(error, "Failed to submit application"));
    }
  };

  const handleCVUploadComplete = async () => {
    // Refresh CVs after upload
    try {
      const cvsRes = await candidateService.getCandidateCVs();
      setCvs(Array.isArray(cvsRes) ? cvsRes : []);
      setShowCVUpload(false);
    } catch (err) {
      console.error("Error fetching CVs:", err);
    }
  };

  const handleDeleteCV = async (cvId) => {
    if (!window.confirm("Are you sure you want to delete this CV?")) return;

    try {
      setCvLoading(true);
      await api.delete(`/candidates/me/cvs/${cvId}`);
      showSuccess("CV deleted successfully");
      // Refresh CVs
      const cvsRes = await candidateService.getCandidateCVs();
      setCvs(Array.isArray(cvsRes) ? cvsRes : []);
    } catch (error) {
      showError(getErrorMessage(error, "Failed to delete CV"));
    } finally {
      setCvLoading(false);
    }
  };

  const handleDownloadCV = async (cvId, filename) => {
    try {
      const response = await api.get(`/candidates/me/cvs/${cvId}/download`);
      const downloadUrl = response.data.downloadUrl;
      const fileName = response.data.fileName || filename || `CV_${cvId}.pdf`;

      // Open the download URL in a new tab
      window.open(downloadUrl, "_blank");
    } catch (error) {
      showError(getErrorMessage(error, "Failed to download CV"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load candidate profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <button
              onClick={() => setActiveTab("offers")}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "offers"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Offers
            </button>
            Welcome, {candidate.firstName} {candidate.lastName}
          </h1>
          <p className="text-gray-600">{candidate.email}</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "profile"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaUser className="inline mr-2" />
                My Profile
              </button>
              <button
                onClick={() => setActiveTab("applications")}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "applications"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaBriefcase className="inline mr-2" />
                My Applications ({applications.length})
              </button>
              <button
                onClick={() => setActiveTab("positions")}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "positions"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaFileAlt className="inline mr-2" />
                Available Positions ({availablePositions.length})
              </button>
              <button
                onClick={() => setActiveTab("myPositions")}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "myPositions"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaBriefcase className="inline mr-2" />
                My Positions
              </button>
            </nav>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Profile Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <p className="mt-1 text-gray-900">{candidate.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <p className="mt-1 text-gray-900">{candidate.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-gray-900">{candidate.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <p className="mt-1 text-gray-900">
                  {candidate.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <p className="mt-1 text-gray-900">
                  {candidate.currentLocation || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total Experience
                </label>
                <p className="mt-1 text-gray-900">
                  {candidate.totalExperience || 0} years
                </p>
              </div>
            </div>

            {/* Application Stages Overview */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Application Status Overview
              </h3>
              {applications.length === 0 ? (
                <p className="text-gray-600">You have no applications yet.</p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app.applicationId}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {app.position?.jobTitle || "Unknown Position"}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Department: {app.position?.department || "N/A"}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          Stage:{" "}
                          <span className="font-medium">
                            {getStageLabel(app.currentStage)}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Applied:{" "}
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() =>
                            navigate(`/applications/${app.applicationId}`)
                          }
                          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                        >
                          <FaEye className="mr-1" /> View Details
                        </button>
                        {canUploadDocuments(app.status) && (
                          <button
                            onClick={() =>
                              navigate(
                                `/applications/${app.applicationId}/documents`
                              )
                            }
                            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                          >
                            <FaUpload className="mr-1" /> Upload Documents
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CV Management Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">My CVs</h3>
              </div>

              {/* CV Upload Component */}
              {showCVUpload && cvs.length === 0 && (
                <div className="mb-6">
                  <CandidateCVUpload
                    candidateId={candidate.candidateId}
                    onUploadComplete={handleCVUploadComplete}
                  />
                </div>
              )}

              {/* List of uploaded CVs */}
              {cvLoading ? (
                <div className="flex justify-center py-8">
                  <FaSpinner className="animate-spin text-2xl text-indigo-600" />
                </div>
              ) : cvs.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <FaFileAlt className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-4">No CVs uploaded yet.</p>
                  {!showCVUpload && (
                    <button
                      onClick={() => setShowCVUpload(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm inline-flex items-center"
                    >
                      <FaUpload className="mr-2" />
                      Upload Your First CV
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {cvs.map((cv) => (
                    <div
                      key={cv.cvId}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3 flex-1">
                          <FaFileAlt className="text-indigo-600 text-xl mt-1" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {cv.candidate.firstName || `CV`}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Uploaded:{" "}
                              {new Date(
                                cv.uploadedAt || cv.cvId
                              ).toLocaleDateString()}
                            </p>
                            {cv.parsedContent && (
                              <p className="text-xs text-gray-500 mt-1">
                                Parsed and processed
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() =>
                              handleDownloadCV(cv.cvId, cv.filename)
                            }
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download CV"
                          >
                            <FaDownload />
                          </button>
                          <button
                            onClick={() => handleDeleteCV(cv.cvId)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete CV"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skills for Screening Verification */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Skills for Screening Verification
                </h3>
                {candidateSkills.length > 0 && (
                  <button
                    onClick={() => setShowAddSkills(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    + Add More Skills
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Add skills in your profile so reviewers can verify them during
                CV review.
              </p>

              {candidateSkills.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 text-center">
                  <p className="text-sm text-gray-600 font-medium mb-2">
                    No skills added yet
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Add skills from your profile so reviewers can verify them
                    during CV review.
                  </p>
                  <button
                    onClick={() => setShowAddSkills(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Add the first skill
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {candidateSkills.map((skill) => (
                    <div
                      key={skill.id || skill.skillId}
                      className="border border-gray-200 rounded-lg p-4 flex items-start justify-between hover:shadow-md transition duration-200"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {skill.skill.skillName}
                        </p>
                        {skill.proficiencyLevel && (
                          <p className="text-sm text-gray-600">
                            Proficiency:{" "}
                            {typeof skill.proficiencyLevel === "object"
                              ? skill.proficiencyLevel.levelName
                              : skill.proficiencyLevel}
                          </p>
                        )}
                        {skill.yearsOfExperience !== undefined &&
                          skill.yearsOfExperience !== null && (
                            <p className="text-sm text-gray-600">
                              Experience: {skill.yearsOfExperience} yrs
                            </p>
                          )}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {skill.verified && (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium whitespace-nowrap">
                            ✓ Verified
                          </span>
                        )}
                        <button
                          onClick={async () => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this skill?"
                              )
                            ) {
                              try {
                                // Optimistic UI: remove locally first
                                setCandidateSkills((prev) =>
                                  prev.filter(
                                    (s) => s.id !== (skill.id || skill.skillId)
                                  )
                                );
                                // Call API to delete by CandidateSkills.id
                                await candidateService.deleteCandidateSkill(
                                  skill.id || skill.skillId
                                );
                                showSuccess("Skill deleted successfully");
                                // Ensure state matches server
                                await fetchCandidateData();
                              } catch (error) {
                                showError(
                                  getErrorMessage(
                                    error,
                                    "Failed to delete skill"
                                  )
                                );
                                // Restore list from server on failure
                                await fetchCandidateData();
                              }
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Skill"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              My Applications
            </h2>

            {/* CV Warning Banner */}
            {cvs.length === 0 && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FaClock className="text-yellow-600 text-xl mt-1 mr-3" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-800 mb-1">
                      CV Required for Screening
                    </h4>
                    <p className="text-sm text-yellow-700 mb-2">
                      Your application cannot be moved to the screening stage
                      without a CV. Please upload your CV in the Profile tab.
                    </p>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className="text-sm bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center"
                    >
                      <FaUpload className="mr-2" />
                      Go to Profile & Upload CV
                    </button>
                  </div>
                </div>
              </div>
            )}

            {applications.length === 0 ? (
              <div className="text-center py-12">
                <FaBriefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">You have no applications yet.</p>
                <button
                  onClick={() => setActiveTab("positions")}
                  className="mt-4 text-indigo-600 hover:text-indigo-800"
                >
                  Browse available positions
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.applicationId}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {app.position?.jobTitle || "Unknown Position"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {app.position?.department || "N/A"}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500">
                          Current Stage
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {getStageLabel(app.currentStage)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">
                          Applied Date
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {app.holdReason && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                        <p className="text-sm text-yellow-800">
                          <strong>On Hold:</strong> {app.holdReason}
                        </p>
                      </div>
                    )}

                    {app.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                        <p className="text-sm text-red-800">
                          <strong>Rejected:</strong> {app.rejectionReason}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/applications/${app.applicationId}`)
                        }
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm flex items-center"
                      >
                        <FaEye className="mr-2" /> View Details
                      </button>
                      {!app.cv &&
                        cvs.length > 0 &&
                        (app.status === "APPLIED" ||
                          app.status === "ON_HOLD") && (
                          <button
                            onClick={async () => {
                              try {
                                const latestCvId = cvs[0].cvId;
                                await api.put(
                                  `/applications/${app.applicationId}/attach-cv/${latestCvId}`
                                );
                                showSuccess("CV attached to application");
                                fetchCandidateData();
                              } catch (err) {
                                showError(
                                  getErrorMessage(err, "Failed to attach CV")
                                );
                              }
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center"
                          >
                            <FaUpload className="mr-2" /> Attach CV
                          </button>
                        )}
                      {canUploadDocuments(app.status) && (
                        <button
                          onClick={() =>
                            navigate(
                              `/applications/${app.applicationId}/documents`
                            )
                          }
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm flex items-center"
                        >
                          <FaUpload className="mr-2" /> Upload Documents
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === "offers" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Offers</h2>
            {offers.length === 0 ? (
              <div className="text-center py-12">
                <FaFileAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No offers available yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => (
                  <div
                    key={offer.offerId}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {offer.offeredDesignation || "Offer"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Application ID:{" "}
                          {offer.application?.applicationId || "-"}
                        </p>
                        {offer.offerLetterUrl && (
                          <a
                            className="text-indigo-600 text-sm hover:text-indigo-800"
                            href={offer.offerLetterUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Offer Letter
                          </a>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getOfferStatusColor(
                          offer.status
                        )}`}
                      >
                        {offer.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-600">Salary Offered</p>
                        <p className="font-semibold text-gray-900">
                          {offer.salaryOffered
                            ? `$${offer.salaryOffered}`
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Joining Date</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(offer.joiningDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Offer Valid Till</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(offer.offerValidTill)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Last Updated</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(offer.updatedAt)}
                        </p>
                      </div>
                    </div>

                    {offer.status === "REJECTED" && offer.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mb-3 text-sm text-red-800">
                        <strong>Rejection Reason:</strong>{" "}
                        {offer.rejectionReason}
                      </div>
                    )}

                    {offer.status === "SEND" && (
                      <div className="flex gap-3">
                        <button
                          disabled={offerActionLoading}
                          onClick={() => handleAcceptOffer(offer.offerId)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 text-sm"
                        >
                          {offerActionLoading
                            ? "Processing..."
                            : "Accept Offer"}
                        </button>
                        <button
                          disabled={offerActionLoading}
                          onClick={() => handleRejectOffer(offer.offerId)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 text-sm"
                        >
                          {offerActionLoading
                            ? "Processing..."
                            : "Reject Offer"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Available Positions Tab */}
        {activeTab === "positions" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Available Positions
            </h2>

            {/* CV Recommendation Banner */}
            {cvs.length === 0 && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FaFileAlt className="text-blue-600 text-xl mt-1 mr-3" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-800 mb-1">
                      Upload Your CV First
                    </h4>
                    <p className="text-sm text-blue-700 mb-2">
                      To improve your application process and speed up
                      screening, we recommend uploading your CV before applying
                      to positions.
                    </p>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <FaUpload className="mr-2" />
                      Upload CV Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {availablePositions.length === 0 ? (
              <div className="text-center py-12">
                <FaFileAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">
                  No available positions at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {availablePositions.map((position) => (
                  <div
                    key={position.positionId}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {position.jobTitle}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {position.department}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          position.status === "OPEN"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {position.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                      {position.jobDescription || "No description available"}
                    </p>

                    <button
                      onClick={() => handleApplyToPosition(position.positionId)}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center"
                    >
                      <FaCheckCircle className="mr-2" /> Apply for this Position
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Positions Tab - Current and Previous */}
        {activeTab === "myPositions" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              My Positions
            </h2>

            {/* Current Applications */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <FaClock className="text-blue-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Current Applications
                </h3>
                <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {
                    applications.filter((app) =>
                      ["APPLIED", "SCREENING", "INTERVIEW", "ON_HOLD"].includes(
                        app.status
                      )
                    ).length
                  }
                </span>
              </div>

              {applications.filter((app) =>
                ["APPLIED", "SCREENING", "INTERVIEW", "ON_HOLD"].includes(
                  app.status
                )
              ).length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <FaClock className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-gray-600">
                    No active applications at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications
                    .filter((app) =>
                      ["APPLIED", "SCREENING", "INTERVIEW", "ON_HOLD"].includes(
                        app.status
                      )
                    )
                    .map((app) => (
                      <div
                        key={app.applicationId}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {app.position?.jobTitle || "Unknown Position"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {app.position?.department || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Applied:{" "}
                              {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              app.status
                            )}`}
                          >
                            {app.status}
                          </span>
                        </div>

                        <div className="mb-4">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Current Stage
                          </label>
                          <p className="text-sm text-gray-900">
                            {getStageLabel(app.currentStage)}
                          </p>
                        </div>

                        {app.holdReason && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                            <p className="text-sm text-yellow-800">
                              <strong>On Hold:</strong> {app.holdReason}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(`/positions/${app.position?.positionId}`)
                            }
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm flex items-center"
                          >
                            <FaEye className="mr-2" /> View Position
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/applications/${app.applicationId}`)
                            }
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm flex items-center"
                          >
                            <FaFileAlt className="mr-2" /> View Application
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Previous Applications */}
            <div>
              <div className="flex items-center mb-4">
                <FaCheckCircle className="text-gray-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Previous Applications
                </h3>
                <span className="ml-3 px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                  {
                    applications.filter((app) =>
                      ["SELECTED", "REJECTED", "WITHDRAWN"].includes(app.status)
                    ).length
                  }
                </span>
              </div>

              {applications.filter((app) =>
                ["SELECTED", "REJECTED", "WITHDRAWN"].includes(app.status)
              ).length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <FaCheckCircle className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-gray-600">No previous applications yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications
                    .filter((app) =>
                      ["SELECTED", "REJECTED", "WITHDRAWN"].includes(app.status)
                    )
                    .map((app) => (
                      <div
                        key={app.applicationId}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {app.position?.jobTitle || "Unknown Position"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {app.position?.department || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Applied:{" "}
                              {new Date(app.appliedAt).toLocaleDateString()}
                              {app.statusUpdatedAt && (
                                <>
                                  {" "}
                                  • Closed:{" "}
                                  {new Date(
                                    app.statusUpdatedAt
                                  ).toLocaleDateString()}
                                </>
                              )}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              app.status
                            )}`}
                          >
                            {app.status}
                          </span>
                        </div>

                        <div className="mb-4">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Final Stage
                          </label>
                          <p className="text-sm text-gray-900">
                            {getStageLabel(app.currentStage)}
                          </p>
                        </div>

                        {app.rejectionReason && (
                          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                            <p className="text-sm text-red-800">
                              <strong>Rejection Reason:</strong>{" "}
                              {app.rejectionReason}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(`/positions/${app.position?.positionId}`)
                            }
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm flex items-center"
                          >
                            <FaEye className="mr-2" /> View Position
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/applications/${app.applicationId}`)
                            }
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm flex items-center"
                          >
                            <FaFileAlt className="mr-2" /> View Application
                          </button>
                          {canUploadDocuments(app.status) && (
                            <button
                              onClick={() =>
                                navigate(
                                  `/applications/${app.applicationId}/documents`
                                )
                              }
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center"
                            >
                              <FaUpload className="mr-2" /> Upload Documents
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={rejectModal.open}
        title="Reject Offer"
        message="Please provide a reason for rejecting this offer."
        confirmText="Reject"
        cancelText="Cancel"
        loading={offerActionLoading}
        onCancel={() => {
          setRejectModal({ open: false, offerId: null });
          setRejectReason("");
        }}
        onConfirm={confirmRejectOffer}
      >
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2"
          rows="3"
          placeholder="Reason for rejection"
        />
      </ConfirmationModal>

      {/* Add Skills Modal */}
      {candidate && (
        <AddSkillsModal
          candidateId={candidate.candidateId}
          isOpen={showAddSkills}
          onClose={() => setShowAddSkills(false)}
          onSkillAdded={() => {
            setShowAddSkills(false);
            fetchCandidateData();
          }}
        />
      )}
    </div>
  );
};

export default CandidateDashboard;
