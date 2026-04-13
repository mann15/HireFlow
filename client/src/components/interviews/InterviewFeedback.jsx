import React, { useState } from "react";
import { submitFeedback } from "../../services/interviewService";
import { feedbackService } from "../../services/apiService";
import {
  getErrorMessage,
  showError,
  showSuccess,
} from "../../utils/toastUtils";

const InterviewFeedback = ({
  interviewId,
  candidateName,
  onComplete,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    feedback_comments: "",
    overall_rating: 3,
    communication_skills: 3,
    technical_knowledge: 3,
    cultural_fit_rating: 3,
    recommendation: "HIRE",
    strengths: "",
    areas_of_improvement: "",
    stage: "PANELIST",
    hr_notes: "",
  });
  const [techRatings, setTechRatings] = useState([
    { tech: "Primary Tech", rating: 3 },
  ]);
  // Automated score disabled per requirement (manual-only)
  const [autoScoreEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Prefill when editing existing feedback
  React.useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        feedback_comments:
          initialData.feedback_comments ?? prev.feedback_comments,
        overall_rating: initialData.overall_rating ?? prev.overall_rating,
        communication_skills:
          initialData.communication_skills ?? prev.communication_skills,
        technical_knowledge:
          initialData.technical_knowledge ?? prev.technical_knowledge,
        cultural_fit_rating:
          initialData.cultural_fit_rating ?? prev.cultural_fit_rating,
        recommendation: initialData.recommendation ?? prev.recommendation,
        strengths: initialData.strengths ?? prev.strengths,
        areas_of_improvement:
          initialData.areas_of_improvement ?? prev.areas_of_improvement,
        stage: initialData.stage ?? prev.stage,
        hr_notes: initialData.hr_notes ?? prev.hr_notes,
      }));
      if (
        Array.isArray(initialData.tech_ratings) &&
        initialData.tech_ratings.length > 0
      ) {
        setTechRatings(
          initialData.tech_ratings.map((t) => ({
            tech: t.tech,
            rating: t.rating,
          }))
        );
      }
    }
  }, [initialData]);

  const recommendations = [
    "STRONG_HIRE",
    "HIRE",
    "HOLD",
    "NO_HIRE",
    "STRONG_NO_HIRE",
  ];


  const updateTech = (index, field, value) => {
    const next = [...techRatings];
    next[index] = { ...next[index], [field]: value };
    setTechRatings(next);
  };

  const addTechRow = () => {
    setTechRatings([...techRatings, { tech: "", rating: 3 }]);
  };

  const removeTechRow = (index) => {
    setTechRatings(techRatings.filter((_, i) => i !== index));
  };

  // Automated score removed; no auto-score calculation sent

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        tech_ratings: techRatings,
      };

      if (initialData?.id) {
        // Update existing feedback
        await feedbackService.updateInterviewFeedback(
          interviewId,
          initialData.id,
          payload
        );
      } else {
        // Submit new feedback
        await submitFeedback(interviewId, payload);
      }
      showSuccess("Feedback submitted successfully!");
      if (onComplete) onComplete();
    } catch (err) {
      const message = getErrorMessage(err, "Failed to submit feedback");
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const RatingInput = ({ label, value, onChange }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} *
      </label>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min="1"
          max="5"
          step="0.5"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1"
        />
        <span className="text-lg font-semibold w-12 text-center">{value}</span>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Poor</span>
        <span>Excellent</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Submit Interview Feedback</h2>
      {candidateName && (
        <p className="text-gray-600 mb-6">Candidate: {candidateName}</p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Stage is set automatically to PANELIST for interviewer feedback */}

          <RatingInput
            label="Overall Rating"
            value={formData.overall_rating}
            onChange={(val) =>
              setFormData({ ...formData, overall_rating: val })
            }
          />

          <RatingInput
            label="Communication Skills"
            value={formData.communication_skills}
            onChange={(val) =>
              setFormData({ ...formData, communication_skills: val })
            }
          />

          <RatingInput
            label="Technical Knowledge"
            value={formData.technical_knowledge}
            onChange={(val) =>
              setFormData({ ...formData, technical_knowledge: val })
            }
          />

          <RatingInput
            label="Cultural Fit"
            value={formData.cultural_fit_rating}
            onChange={(val) =>
              setFormData({ ...formData, cultural_fit_rating: val })
            }
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                Technology Ratings (per position requirements)
              </h3>
              <button
                type="button"
                onClick={addTechRow}
                className="text-blue-600 text-sm hover:text-blue-800"
              >
                + Add technology
              </button>
            </div>
            <div className="space-y-3">
              {techRatings.map((tech, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center border border-gray-100 rounded-md p-3"
                >
                  <input
                    type="text"
                    value={tech.tech}
                    onChange={(e) => updateTech(idx, "tech", e.target.value)}
                    className="md:col-span-5 border border-gray-300 rounded px-3 py-2"
                    placeholder="e.g., React, Java, SQL"
                  />
                  <div className="md:col-span-5 flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.5"
                      value={tech.rating}
                      onChange={(e) =>
                        updateTech(idx, "rating", parseFloat(e.target.value))
                      }
                      className="flex-1"
                    />
                    <span className="w-10 text-center font-semibold">
                      {tech.rating}
                    </span>
                  </div>
                  <div className="md:col-span-2 text-right">
                    {techRatings.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTechRow(idx)}
                        className="text-red-600 text-sm hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Auto-score notes removed */}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recommendation *
            </label>
            <select
              value={formData.recommendation}
              onChange={(e) =>
                setFormData({ ...formData, recommendation: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              {recommendations.map((rec) => (
                <option key={rec} value={rec}>
                  {rec.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback Comments *
            </label>
            <textarea
              value={formData.feedback_comments}
              onChange={(e) =>
                setFormData({ ...formData, feedback_comments: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows="4"
              placeholder="Overall interview feedback..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Strengths
            </label>
            <textarea
              value={formData.strengths}
              onChange={(e) =>
                setFormData({ ...formData, strengths: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows="3"
              placeholder="Key strengths observed during the interview..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Areas of Improvement
            </label>
            <textarea
              value={formData.areas_of_improvement}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  areas_of_improvement: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows="3"
              placeholder="Areas where the candidate can improve..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              HR / Reviewer Notes (optional)
            </label>
            <textarea
              value={formData.hr_notes}
              onChange={(e) =>
                setFormData({ ...formData, hr_notes: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows="3"
              placeholder="Additional remarks from HR or reviewer"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onComplete}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InterviewFeedback;
