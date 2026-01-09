import React, { useState, useEffect } from "react";
import { candidateService } from "../../services/candidateService";
import { getApplicationById } from "../../services/applicationService";
import {
  getErrorMessage,
  showError,
  showSuccess,
  showWarning,
} from "../../utils/toastUtils";

const InterviewSkillAssessment = ({ interviewId, applicationId, onSubmit }) => {
  const [candidate, setCandidate] = useState(null);
  const [skills, setSkills] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [overallRating, setOverallRating] = useState(0);
  const [recommendation, setRecommendation] = useState("HOLD");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [applicationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const appData = await getApplicationById(applicationId);
      const candidateData = await candidateService.getCandidateById(
        appData.candidateId
      );
      setCandidate(candidateData);

      // Load candidate skills
      if (candidateData.skills) {
        const skillsWithRating = candidateData.skills.map((skill) => ({
          ...skill,
          verified: skill.verified || false,
          yearsOfExperience: skill.yearsOfExperience || 0,
          rating: 0,
          comments: "",
        }));
        setSkills(skillsWithRating);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
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

  const handleSkillRating = (skillIndex, rating) => {
    const updatedSkills = [...skills];
    updatedSkills[skillIndex].rating = parseFloat(rating);
    setSkills(updatedSkills);
  };

  const handleSkillComments = (skillIndex, comments) => {
    const updatedSkills = [...skills];
    updatedSkills[skillIndex].comments = comments;
    setSkills(updatedSkills);
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      showWarning("Please provide overall feedback");
      return;
    }

    try {
      setSaving(true);

      // Update skills verification and experience
      for (const skill of skills) {
        if (skill.verified) {
          await fetch(
            `/api/candidates/${candidate.candidateId}/skills/${skill.id}/verify`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                verified: skill.verified,
                yearsOfExperience: skill.yearsOfExperience,
              }),
            }
          );
        }
      }

      // Submit interview feedback with skill assessments
      const feedbackData = {
        interviewId: interviewId,
        feedback: feedback,
        overallRating: overallRating,
        recommendation: recommendation,
        skillAssessments: skills
          .filter((s) => s.rating > 0)
          .map((s) => ({
            skillId: s.id,
            rating: s.rating,
            comments: s.comments,
          })),
      };

      await fetch("/api/interview-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData),
      });

      showSuccess("Feedback submitted successfully");
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      showError(getErrorMessage(error, "Failed to submit feedback"));
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
        </div>
      </div>

      {/* Skills Assessment */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          Skills Assessment & Verification
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Tick skills the candidate possesses, specify years of experience, and
          rate their proficiency.
        </p>

        {skills.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No skills listed for this candidate
          </p>
        ) : (
          <div className="space-y-4">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-start gap-4 mb-3">
                  <input
                    type="checkbox"
                    checked={skill.verified}
                    onChange={(e) =>
                      handleSkillVerification(index, e.target.checked)
                    }
                    className="mt-1 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">
                      {skill.skillName || skill.name}
                    </p>
                    {skill.proficiencyLevel && (
                      <p className="text-sm text-gray-500">
                        Claimed Proficiency: {skill.proficiencyLevel}
                      </p>
                    )}
                  </div>
                  <div className="w-40">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {skill.verified && (
                  <div className="ml-9 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={skill.rating}
                        onChange={(e) =>
                          handleSkillRating(index, e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assessment Comments
                      </label>
                      <textarea
                        value={skill.comments}
                        onChange={(e) =>
                          handleSkillComments(index, e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        rows={2}
                        placeholder="Observations and comments about this skill..."
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overall Feedback */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          Overall Interview Feedback
        </h3>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          rows={6}
          placeholder="Provide detailed feedback about the interview... (Required)"
          required
        />
      </div>

      {/* Rating and Recommendation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Rating & Recommendation</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating (0-10)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={overallRating}
              onChange={(e) =>
                setOverallRating(parseFloat(e.target.value) || 0)
              }
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
              <option value="PROCEED">Proceed to Next Round</option>
              <option value="SELECT">Select</option>
              <option value="REJECT">Reject</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleSubmitFeedback}
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
            "Submit Feedback"
          )}
        </button>
      </div>
    </div>
  );
};

export default InterviewSkillAssessment;
