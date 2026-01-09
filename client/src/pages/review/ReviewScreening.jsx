import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  assignReviewer,
  shortlistCandidate,
  submitScreeningFeedback,
  addScreeningComment,
  getScreeningComments,
  getScreeningFeedback,
  getScreeningNotifications,
  checkCandidateHistory,
} from "../../services/reviewService";
import { candidateService } from "../../services/candidateService";
import SearchableDropdown from "../../components/SearchableDropdown";
import { showSuccess, showError } from "../../utils/toastUtils";

// Basic reviewer + screening UI to wire up backend flows using authenticated user context.
const ReviewScreening = ({ positionId, applicationId }) => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { currentUser } = useSelector((state) => state.user);

  const resolvedPositionId = positionId || params.id;
  const resolvedApplicationId =
    applicationId || params.applicationId || searchParams.get("applicationId");
  const currentUserId =
    currentUser?.id || currentUser?.userId || currentUser?.user?.id;

  const [reviewerId, setReviewerId] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [feedbackScore, setFeedbackScore] = useState("");
  const [feedbackRecommendation, setFeedbackRecommendation] = useState("HOLD");
  const [feedbackComments, setFeedbackComments] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [verifiedSkillName, setVerifiedSkillName] = useState("");
  const [verifiedSkillYears, setVerifiedSkillYears] = useState("");
  const [verifiedSkills, setVerifiedSkills] = useState([]);

  useEffect(() => {
    fetchCandidatesList();
  }, []);

  useEffect(() => {
    if (resolvedApplicationId) {
      fetchComments();
      fetchNotifications();
      fetchFeedback();
    }
  }, [resolvedApplicationId]);

  const fetchCandidatesList = async () => {
    try {
      setLoadingCandidates(true);
      const data = await candidateService.getAllCandidates();
      setCandidates(data || []);
    } catch (err) {
      console.error("Failed to load candidates", err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await getScreeningComments(resolvedApplicationId);
      setComments(data || []);
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await getScreeningNotifications(resolvedApplicationId);
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  const fetchFeedback = async () => {
    try {
      const data = await getScreeningFeedback(resolvedApplicationId);
      setFeedbackList(data || []);
    } catch (err) {
      console.error("Failed to load feedback", err);
    }
  };

  const handleAssignReviewer = async () => {
    try {
      await assignReviewer(resolvedPositionId, reviewerId);
      showSuccess("Reviewer assigned successfully");
    } catch (error) {
      console.error("Failed to assign reviewer", error);
      showError("Failed to assign reviewer");
    }
  };

  const handleAddComment = async () => {
    try {
      await addScreeningComment({
        applicationId: resolvedApplicationId,
        userId: currentUserId,
        comment,
      });
      setComment("");
      fetchComments();
    } catch (error) {
      console.error("Failed to add comment", error);
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      await submitScreeningFeedback({
        applicationId: resolvedApplicationId,
        reviewerId: currentUserId,
        comments: feedbackComments,
        score: Number(feedbackScore) || 0,
        recommendation: feedbackRecommendation,
        verifiedSkills,
      });
      setFeedbackComments("");
      setFeedbackScore("");
      setVerifiedSkills([]);
      setVerifiedSkillName("");
      setVerifiedSkillYears("");
      fetchFeedback();
    } catch (err) {
      console.error("Failed to submit feedback", err);
    }
  };

  const handleShortlistCandidate = async () => {
    try {
      await shortlistCandidate(resolvedPositionId, candidateId);
      showSuccess("Candidate shortlisted successfully");
    } catch (error) {
      console.error("Failed to shortlist candidate", error);
      showError("Failed to shortlist candidate");
    }
  };

  const handleCheckHistory = async () => {
    try {
      await checkCandidateHistory(resolvedApplicationId);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to check history", err);
    }
  };

  const handleAddVerifiedSkill = () => {
    if (!verifiedSkillName.trim()) return;
    const years = Number(verifiedSkillYears) || 0;
    setVerifiedSkills((prev) => [
      ...prev,
      {
        skillName: verifiedSkillName.trim(),
        yearsOfExperience: years,
        verified: true,
        verifiedById: currentUserId,
      },
    ]);
    setVerifiedSkillName("");
    setVerifiedSkillYears("");
  };

  const handleRemoveVerifiedSkill = (index) => {
    setVerifiedSkills((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-6xl mx-auto p-10 mt-20 space-y-6">
      <h1
        className="text-3xl font-bold mb-6"
        style={{ color: "var(--secondary-color)" }}
      >
        Review Screening
      </h1>

      {/* Assign Reviewer Section */}
      <div
        className="bg-white rounded-lg p-6 border"
        style={{ borderColor: "var(--background-color-light)" }}
      >
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "var(--secondary-color)" }}
        >
          Assign Reviewer
        </h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--secondary-color)" }}
            >
              Reviewer ID
            </label>
            <input
              type="text"
              placeholder="Enter Reviewer ID"
              value={reviewerId}
              onChange={(e) => setReviewerId(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2"
              style={{ borderColor: "var(--background-color-light)" }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--primary-color)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--background-color-light)")
              }
            />
          </div>
          <button
            onClick={handleAssignReviewer}
            className="text-white px-6 py-2 rounded-md transition-colors"
            style={{ backgroundColor: "var(--primary-color)" }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = "var(--primary-color-dark)")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "var(--primary-color)")
            }
          >
            Assign
          </button>
        </div>
      </div>

      {/* Screening Feedback Section */}
      <div
        className="bg-white rounded-lg p-6 border"
        style={{ borderColor: "var(--background-color-light)" }}
      >
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "var(--secondary-color)" }}
        >
          Screening Feedback
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--secondary-color)" }}
              >
                Score
              </label>
              <input
                type="number"
                placeholder="Enter Score (0-100)"
                value={feedbackScore}
                onChange={(e) => setFeedbackScore(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:outline-none"
                style={{ borderColor: "var(--background-color-light)" }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--primary-color)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--background-color-light)")
                }
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--secondary-color)" }}
              >
                Recommendation
              </label>
              <select
                value={feedbackRecommendation}
                onChange={(e) => setFeedbackRecommendation(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:outline-none"
                style={{ borderColor: "var(--background-color-light)" }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--primary-color)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--background-color-light)")
                }
              >
                <option value="HOLD">Hold</option>
                <option value="SHORTLIST">Shortlist</option>
                <option value="REJECT">Reject</option>
              </select>
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--secondary-color)" }}
            >
              Feedback Comments
            </label>
            <textarea
              placeholder="Enter your detailed feedback"
              value={feedbackComments}
              onChange={(e) => setFeedbackComments(e.target.value)}
              rows="4"
              className="w-full border rounded-md px-3 py-2 focus:outline-none"
              style={{ borderColor: "var(--background-color-light)" }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--primary-color)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--background-color-light)")
              }
            ></textarea>
          </div>

          {/* Verified Skills */}
          <div
            className="border-t pt-4"
            style={{ borderColor: "var(--background-color-light)" }}
          >
            <h3
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--secondary-color)" }}
            >
              Verified Skills
            </h3>
            <div className="flex gap-2 items-end mb-3">
              <div className="flex-1">
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: "var(--secondary-color)" }}
                >
                  Skill Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Java, React"
                  value={verifiedSkillName}
                  onChange={(e) => setVerifiedSkillName(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none"
                  style={{ borderColor: "var(--background-color-light)" }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--primary-color)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor =
                      "var(--background-color-light)")
                  }
                />
              </div>
              <div className="w-32">
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: "var(--secondary-color)" }}
                >
                  Years
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Years"
                  value={verifiedSkillYears}
                  onChange={(e) => setVerifiedSkillYears(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none"
                  style={{ borderColor: "var(--background-color-light)" }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--primary-color)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor =
                      "var(--background-color-light)")
                  }
                />
              </div>
              <button
                type="button"
                onClick={handleAddVerifiedSkill}
                className="text-white px-4 py-2 rounded-md transition-colors"
                style={{ backgroundColor: "var(--background-color)" }}
                onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.target.style.opacity = "1")}
              >
                Add
              </button>
            </div>
            {verifiedSkills.length > 0 && (
              <ul className="space-y-2">
                {verifiedSkills.map((vs, idx) => (
                  <li
                    key={`${vs.skillName}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-md border"
                    style={{
                      backgroundColor: "var(--background-color-light)",
                      borderColor: "var(--background-color-light)",
                    }}
                  >
                    <span style={{ color: "var(--secondary-color)" }}>
                      <span className="font-medium">{vs.skillName}</span> -{" "}
                      {vs.yearsOfExperience} years
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVerifiedSkill(idx)}
                      className="text-sm font-medium"
                      style={{ color: "#dc2626" }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={handleSubmitFeedback}
            className="w-full text-white py-2 rounded-md transition-colors font-medium"
            style={{ backgroundColor: "var(--primary-color)" }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = "var(--primary-color-dark)")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "var(--primary-color)")
            }
          >
            Submit Feedback
          </button>
        </div>
      </div>

      {/* Add Screening Comment Section */}
      <div
        className="bg-white rounded-lg p-6 border"
        style={{ borderColor: "var(--background-color-light)" }}
      >
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "var(--secondary-color)" }}
        >
          Add Screening Comment
        </h2>
        <div className="space-y-3">
          <textarea
            placeholder="Add your comment here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="3"
            className="w-full border rounded-md px-3 py-2 focus:outline-none"
            style={{ borderColor: "var(--background-color-light)" }}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--primary-color)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "var(--background-color-light)")
            }
          ></textarea>
          <button
            onClick={handleAddComment}
            className="text-white px-6 py-2 rounded-md transition-colors"
            style={{ backgroundColor: "var(--primary-color)" }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = "var(--primary-color-dark)")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "var(--primary-color)")
            }
          >
            Add Comment
          </button>
        </div>

        {comments.length > 0 && (
          <div className="mt-4">
            <h3
              className="text-sm font-semibold mb-2"
              style={{ color: "var(--secondary-color)" }}
            >
              Comments History
            </h3>
            <ul className="space-y-2">
              {comments.map((c) => (
                <li
                  key={c.commentId}
                  className="p-3 rounded-md border"
                  style={{
                    backgroundColor: "var(--background-color-light)",
                    borderColor: "var(--background-color-light)",
                  }}
                >
                  <span
                    className="font-medium"
                    style={{ color: "var(--secondary-color)" }}
                  >
                    {c.userName}:
                  </span>{" "}
                  <span
                    style={{ color: "var(--secondary-color)", opacity: 0.8 }}
                  >
                    {c.comment}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Shortlist Candidate Section */}
      <div
        className="bg-white rounded-lg p-6 border"
        style={{ borderColor: "var(--background-color-light)" }}
      >
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "var(--secondary-color)" }}
        >
          Shortlist Candidate
        </h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <SearchableDropdown
              label="Candidate"
              value={candidateId}
              onChange={setCandidateId}
              options={candidates.map((candidate) => ({
                value: candidate.candidateId || candidate.id,
                label: `${candidate.firstName} ${candidate.lastName} (#${
                  candidate.candidateId || candidate.id
                })`,
                subtitle: `${candidate.email}${
                  candidate.phone ? " • " + candidate.phone : ""
                }`,
              }))}
              placeholder="Select a candidate"
              loading={loadingCandidates}
              noOptionsText="No candidates found"
            />
          </div>
          <button
            onClick={handleShortlistCandidate}
            className="text-white px-6 py-2 rounded-md transition-colors"
            style={{ backgroundColor: "var(--background-color)" }}
            onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            Shortlist
          </button>
        </div>
      </div>

      {/* Previous History Notifications Section */}
      <div
        className="bg-white rounded-lg p-6 border"
        style={{ borderColor: "var(--background-color-light)" }}
      >
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "var(--secondary-color)" }}
        >
          Previous History Notifications
        </h2>
        <button
          onClick={handleCheckHistory}
          className="text-white px-6 py-2 rounded-md transition-colors mb-4"
          style={{ backgroundColor: "var(--secondary-color)" }}
          onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.target.style.opacity = "1")}
        >
          Check History
        </button>

        {notifications.length > 0 && (
          <div className="mt-4">
            <h3
              className="text-sm font-semibold mb-2"
              style={{ color: "var(--secondary-color)" }}
            >
              Notifications
            </h3>
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li
                  key={n.id || n.notificationId}
                  className="p-3 rounded-md border"
                  style={{
                    backgroundColor: "var(--background-color-light)",
                    borderColor: "var(--background-color-light)",
                    color: "var(--secondary-color)",
                  }}
                >
                  {n.notificationMessage || n.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Past Feedback Section */}
      <div
        className="bg-white rounded-lg p-6 border"
        style={{ borderColor: "var(--background-color-light)" }}
      >
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "var(--secondary-color)" }}
        >
          Past Feedback
        </h2>
        {feedbackList.length > 0 ? (
          <ul className="space-y-2">
            {feedbackList.map((f) => (
              <li
                key={f.feedbackId}
                className="p-4 rounded-md border"
                style={{
                  backgroundColor: "var(--background-color-light)",
                  borderColor: "var(--background-color-light)",
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span
                      className="font-medium"
                      style={{ color: "var(--secondary-color)" }}
                    >
                      {f.reviewerName}
                    </span>
                    <span
                      className="mx-2"
                      style={{ color: "var(--secondary-color)", opacity: 0.5 }}
                    >
                      •
                    </span>
                    <span
                      className="font-medium"
                      style={{
                        color:
                          f.recommendation === "SHORTLIST"
                            ? "var(--background-color)"
                            : f.recommendation === "REJECT"
                            ? "#dc2626"
                            : "var(--primary-color)",
                      }}
                    >
                      {f.recommendation}
                    </span>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "white",
                      opacity: 0.9,
                    }}
                  >
                    Score: {f.score}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p
            style={{ color: "var(--secondary-color)", opacity: 0.6 }}
            className="italic"
          >
            No feedback available yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewScreening;
