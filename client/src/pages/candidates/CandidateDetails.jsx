import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { candidateService } from "../../services/candidateService";
import Loader from "../../components/Loader";
import CVUpload from "../../components/candidates/CVUpload";
import AddSkillsModal from "../../components/candidates/AddSkillsModal";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import {
  showError,
  showSuccess,
  getErrorMessage,
} from "../../utils/toastUtils";

const CandidateDetails = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [cvs, setCvs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [showCVUpload, setShowCVUpload] = useState(false);
  const [showAddSkills, setShowAddSkills] = useState(false);
  const [deactivateModal, setDeactivateModal] = useState(false);

  useEffect(() => {
    fetchCandidateDetails();
  }, [candidateId]);

  const fetchCandidateDetails = async () => {
    try {
      setLoading(true);
      const [candidateData, cvsData, skillsData] = await Promise.all([
        candidateService.getCandidateById(candidateId),
        candidateService.getCandidateCVs(candidateId),
        candidateService.getCandidateSkills(candidateId),
      ]);

      setCandidate(candidateData);
      setCvs(cvsData);

      // Handle different response formats for skills
      if (Array.isArray(skillsData)) {
        setSkills(skillsData);
      } else if (skillsData?.data && Array.isArray(skillsData.data)) {
        setSkills(skillsData.data);
      } else if (skillsData?.skills && Array.isArray(skillsData.skills)) {
        setSkills(skillsData.skills);
      } else {
        setSkills([]);
      }
    } catch (err) {
      setError(err.error || "Failed to fetch candidate details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      await candidateService.deactivateCandidate(candidateId);
      showSuccess("Candidate deactivated");
      navigate("/candidates");
    } catch (err) {
      const message =
        err.error || getErrorMessage(err, "Failed to deactivate candidate");
      setError(message);
      showError(message);
    } finally {
      setDeactivateModal(false);
    }
  };

  const handleCVUploadComplete = (newCV) => {
    setCvs((prev) => [...prev, newCV]);
    setShowCVUpload(false);
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Candidate not found
            </h1>
            <Link
              to="/candidates"
              className="text-blue-600 hover:text-blue-700"
            >
              Back to Candidates
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {candidate.firstName} {candidate.lastName}
              </h1>
              <p className="text-gray-600">{candidate.email}</p>
            </div>
            <div className="flex gap-4">
              <Link
                to={`/candidates/${candidateId}/edit`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
              >
                Edit Profile
              </Link>
              <button
                onClick={() => setDeactivateModal(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-200 font-medium"
              >
                Deactivate
              </button>
              <button
                onClick={() => navigate("/candidates")}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-200 font-medium"
              >
                Back
              </button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-8">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                candidate.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {candidate.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("skills")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "skills"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Skills ({skills.length})
              </button>
              <button
                onClick={() => setActiveTab("cvs")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "cvs"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                CVs ({cvs.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Personal Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <p className="text-gray-900">{candidate.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <p className="text-gray-900">
                        {candidate.phone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Alternate Phone
                      </label>
                      <p className="text-gray-900">
                        {candidate.alternatePhone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Current Location
                      </label>
                      <p className="text-gray-900">
                        {candidate.currentLocation || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Preferred Location
                      </label>
                      <p className="text-gray-900">
                        {candidate.preferredLocation || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Professional Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Total Experience
                      </label>
                      <p className="text-gray-900">
                        {candidate.totalExperience} years
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Current Salary
                      </label>
                      <p className="text-gray-900">
                        {candidate.currentSalary
                          ? `₹${candidate.currentSalary} LPA`
                          : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Expected Salary
                      </label>
                      <p className="text-gray-900">
                        {candidate.expectedSalary
                          ? `₹${candidate.expectedSalary} LPA`
                          : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Notice Period
                      </label>
                      <p className="text-gray-900">
                        {candidate.noticePeriod
                          ? `${candidate.noticePeriod} days`
                          : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Source
                      </label>
                      <p className="text-gray-900">
                        {candidate.source.replace("_", " ")}
                      </p>
                    </div>
                    {candidate.sourceDetails && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Source Details
                        </label>
                        <p className="text-gray-900">
                          {candidate.sourceDetails}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Links */}
              {(candidate.linkedinUrl ||
                candidate.githubUrl ||
                candidate.portfolioUrl) && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Social Links
                  </h2>
                  <div className="space-y-2">
                    {candidate.linkedinUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          LinkedIn
                        </label>
                        <a
                          href={candidate.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {candidate.linkedinUrl}
                        </a>
                      </div>
                    )}
                    {candidate.githubUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          GitHub
                        </label>
                        <a
                          href={candidate.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {candidate.githubUrl}
                        </a>
                      </div>
                    )}
                    {candidate.portfolioUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Portfolio
                        </label>
                        <a
                          href={candidate.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {candidate.portfolioUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Created At
                    </label>
                    <p className="text-gray-900">
                      {new Date(candidate.createdAt).toLocaleDateString()} at{" "}
                      {new Date(candidate.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Updated
                    </label>
                    <p className="text-gray-900">
                      {new Date(candidate.updatedAt).toLocaleDateString()} at{" "}
                      {new Date(candidate.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "skills" && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Skills for Screening Verification
                </h2>
                <button
                  onClick={() => setShowAddSkills(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                >
                  + Add Skills
                </button>
              </div>

              {skills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200"
                    >
                      <h3 className="font-medium text-gray-900 mb-2">
                        {skill.skill.skillName}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Level:</span>{" "}
                          {skill.proficiencyLevel.levelName}
                        </p>
                        {skill.yearsOfExperience && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Experience:</span>{" "}
                            {skill.yearsOfExperience} years
                          </p>
                        )}
                        {skill.verified && (
                          <p className="text-xs text-green-600 font-medium">
                            ✓ Verified
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-600 font-medium mb-2">
                    No skills added yet
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
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
              )}
            </div>
          )}

          {/* Add Skills Modal */}
          <AddSkillsModal
            candidateId={candidateId}
            isOpen={showAddSkills}
            onClose={() => setShowAddSkills(false)}
            onSkillAdded={() => {
              setShowAddSkills(false);
              fetchCandidateDetails();
            }}
          />

          {activeTab === "cvs" && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">CVs</h2>
                <button
                  onClick={() => setShowCVUpload(!showCVUpload)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  {showCVUpload ? "Hide Upload" : "Upload CV"}
                </button>
              </div>

              {/* CV Upload Section */}
              {showCVUpload && (
                <div className="mb-6">
                  <CVUpload
                    candidateId={candidateId}
                    onUploadComplete={handleCVUploadComplete}
                  />
                </div>
              )}

              {cvs.length > 0 ? (
                <div className="space-y-4">
                  {cvs.map((cv) => (
                    <div
                      key={cv.cvId}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            CV for Position: {cv.positionId.jobTitle}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Uploaded: {new Date(cv.cvId).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                            View
                          </button>
                          <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No CVs uploaded yet</p>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Upload the first CV
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={deactivateModal}
        title="Deactivate Candidate"
        message="Are you sure you want to deactivate this candidate?"
        confirmText="Deactivate"
        cancelText="Cancel"
        onCancel={() => setDeactivateModal(false)}
        onConfirm={handleDeactivate}
      />
    </div>
  );
};

export default CandidateDetails;
