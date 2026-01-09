import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { candidateService } from "../../services/candidateService";
import {
  getApplicationById,
  moveToInterview,
} from "../../services/applicationService";
import {
  checkCandidateHistory,
  submitScreeningFeedback,
  verifyCandidateSkill,
} from "../../services/reviewService";
import {
  getErrorMessage,
  showError,
  showSuccess,
  showWarning,
} from "../../utils/toastUtils";

const CVReviewPanel = ({ applicationId, onUpdate }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [application, setApplication] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [skills, setSkills] = useState([]);
  const [comments, setComments] = useState("");
  const [recommendation, setRecommendation] = useState("HOLD");
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadApplicationAndCandidate();
    checkCandidateHistoryData();
  }, [applicationId]);

  const loadApplicationAndCandidate = async () => {
    try {
      setLoading(true);
      const appData = await getApplicationById(applicationId);
      setApplication(appData);

      const candidateData = await candidateService.getCandidateById(
        appData.candidate.candidateId
      );
      setCandidate(candidateData);
      console.log(candidateData);

      // Load candidate skills with verification status
      if (candidateData.skills) {
        const skillsWithVerification = candidateData.skills.map((skill) => ({
          ...skill,
          verified: skill.verified || false,
          yearsOfExperience: skill.yearsOfExperience || 0,
        }));
        setSkills(skillsWithVerification);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkCandidateHistoryData = async () => {
    try {
      // Check if candidate was previously screened or interviewed
      const history = await checkCandidateHistory(applicationId);

      if (history.hasPreviousScreening || history.hasPreviousInterview) {
        setNotification({
          type: "warning",
          message:
            history.message ||
            "This candidate has been screened/interviewed previously",
          details: history.details || [],
        });
      }
    } catch (error) {
      console.error("Error checking candidate history:", error);
    }
  };

  const handleSkillVerification = (skillIndex, verified) => {
    const updatedSkills = [...skills];
    updatedSkills[skillIndex].verified = verified;
    setSkills(updatedSkills);
  };

  const handleYearsOfExperience = (skillIndex, years) => {
    const updatedSkills = [...skills];
    updatedSkills[skillIndex].yearsOfExperience = parseFloat(years) || 0;
    setSkills(updatedSkills);
  };

  const handleSubmitReview = async () => {
    if (!comments.trim()) {
      showWarning("Please add review comments");
      return;
    }

    const reviewerId =
      currentUser?.id || currentUser?.userId || currentUser?.user?.id;
    if (!reviewerId) {
      showError("Unable to determine reviewer. Please re-login and try again.");
      return;
    }

    try {
      setSaving(true);

      // Update skills verification
      for (const skill of skills) {
        if (skill.verified && skill.id) {
          try {
            await verifyCandidateSkill(candidate.candidateId, skill.id, {
              verified: skill.verified,
              yearsOfExperience: skill.yearsOfExperience,
            });
          } catch (skillErr) {
            console.error("Error verifying skill:", skillErr);
          }
        }
      }

      // Submit screening feedback
      await submitScreeningFeedback({
        applicationId: applicationId,
        reviewerId: reviewerId,
        comments: comments,
        score: score,
        recommendation: recommendation,
      });

      // If recommendation is SHORTLIST, automatically move to interview stage
      if (recommendation === "SHORTLIST") {
        try {
          await moveToInterview(applicationId);
          showSuccess(
            "Review submitted and candidate moved to interview stage!"
          );
        } catch (moveErr) {
          console.error("Error moving to interview:", moveErr);
          showError(
            "Review submitted, but failed to move to interview stage. Please move manually."
          );
        }
      } else {
        showSuccess("Review submitted successfully");
      }

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error submitting review:", error);
      showError(getErrorMessage(error, "Failed to submit review"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* History Notification */}
      {notification && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                {notification.message}
              </h3>
              {notification.details && (
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    {notification.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Candidate Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Candidate Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">
              {candidate?.firstName} {candidate?.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{candidate?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{candidate?.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Position</p>
            <p className="font-medium">{application?.position?.jobTitle}</p>
          </div>
        </div>
      </div>

      {/* Skills Evaluation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          Skills Evaluation & Verification
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Tick the skills the candidate possesses and specify years of
          experience for each skill.
        </p>

        {skills.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No skills listed for this candidate
          </p>
        ) : (
          <div className="space-y-3">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={skill.verified}
                  onChange={(e) =>
                    handleSkillVerification(index, e.target.checked)
                  }
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <p className="font-medium">{skill.skillName || skill.name}</p>
                  {skill.proficiencyLevel && (
                    <p className="text-sm text-gray-500">
                      Proficiency: {skill.proficiencyLevel}
                    </p>
                  )}
                </div>
                <div className="w-48">
                  <label className="block text-sm text-gray-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={skill.yearsOfExperience}
                    onChange={(e) =>
                      handleYearsOfExperience(index, e.target.value)
                    }
                    disabled={!skill.verified}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Comments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Review Comments</h3>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          rows={6}
          placeholder="Add your detailed review comments here... (Required)"
          required
        />
      </div>

      {/* Score and Recommendation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Score & Recommendation</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Score (0-10)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={score}
              onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommendation
            </label>
            <select
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="HOLD">Hold</option>
              <option value="SHORTLIST">Shortlist for Interview</option>
              <option value="REJECT">Reject</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleSubmitReview}
          disabled={saving}
          className={`px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium ${
            saving ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {saving ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </button>
      </div>
    </div>
  );
};

export default CVReviewPanel;
