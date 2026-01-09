import React, { useState, useEffect } from "react";
import {
  assignReviewer,
  getPositionReviewers,
  removeReviewer,
} from "../../services/reviewService";
import { userService } from "../../services/apiService";
import ConfirmationModal from "../common/ConfirmationModal";
import {
  showError,
  showSuccess,
  getErrorMessage,
} from "../../utils/toastUtils";

const ReviewerAssignment = ({ positionId }) => {
  const [reviewers, setReviewers] = useState([]);
  const [availableReviewers, setAvailableReviewers] = useState([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [removeModal, setRemoveModal] = useState({
    open: false,
    reviewerId: null,
  });

  useEffect(() => {
    loadData();
  }, [positionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load assigned reviewers
      const assignedReviewers = await getPositionReviewers(positionId);
      setReviewers(assignedReviewers || []);

      // Load all users and filter by reviewer roles
      const users = await userService.getUsers();
      const eligibleReviewers = users.filter((user) => {
        const hasReviewerRole =
          user.role &&
          (user.role.roleName === "HR" ||
            user.role.roleName === "REVIEWER" ||
            user.role.roleName === "RECRUITER" ||
            user.role.roleName === "INTERVIEWER");

        const alreadyAssigned = assignedReviewers.some(
          (r) => r.reviewerId === user.userId
        );

        return hasReviewerRole && !alreadyAssigned;
      });
      setAvailableReviewers(eligibleReviewers);
    } catch (err) {
      console.error("Error loading reviewers:", err);
      setError("Failed to load reviewers");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignReviewer = async (e) => {
    e.preventDefault();

    if (!selectedReviewerId) {
      setError("Please select a reviewer");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await assignReviewer(positionId, selectedReviewerId);
      setSelectedReviewerId("");
      await loadData();
      showSuccess("Reviewer assigned");
    } catch (err) {
      console.error("Error assigning reviewer:", err);
      setError(err.message || "Failed to assign reviewer");
      showError(getErrorMessage(err, "Failed to assign reviewer"));
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveReviewer = async (reviewerId) => {
    setRemoveModal({ open: true, reviewerId });
  };

  const confirmRemoveReviewer = async () => {
    try {
      await removeReviewer(positionId, removeModal.reviewerId);
      await loadData();
      showSuccess("Reviewer removed");
    } catch (err) {
      console.error("Error removing reviewer:", err);
      setError(err.message || "Failed to remove reviewer");
      showError(getErrorMessage(err, "Failed to remove reviewer"));
    } finally {
      setRemoveModal({ open: false, reviewerId: null });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        Assigned Reviewers for Screening
      </h3>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Assigned Reviewers List */}
      <div className="mb-6">
        {reviewers.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No reviewers assigned to this position yet.
          </p>
        ) : (
          <div className="space-y-2">
            {reviewers.map((reviewer) => (
              <div
                key={reviewer.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{reviewer.reviewerName}</p>
                  <p className="text-sm text-gray-600">
                    {reviewer.reviewerEmail}
                  </p>
                  <p className="text-xs text-gray-500">
                    Assigned on{" "}
                    {new Date(reviewer.assignedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveReviewer(reviewer.reviewerId)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign New Reviewer Form */}
      <form onSubmit={handleAssignReviewer} className="border-t pt-4">
        <h4 className="font-medium mb-3">Assign New Reviewer</h4>
        <div className="flex gap-3">
          <select
            value={selectedReviewerId}
            onChange={(e) => setSelectedReviewerId(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Select a reviewer...</option>
            {availableReviewers
              .filter(
                (user) =>
                  !reviewers.some((r) => r.reviewer?.userId === user.userId)
              )
              .map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.firstName} {user.lastName} - {user.role?.roleName}
                </option>
              ))}
          </select>
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium ${
              saving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {saving ? "Assigning..." : "Assign"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Reviewers can review CVs and provide screening feedback for candidates
          applying to this position.
        </p>
      </form>

      <ConfirmationModal
        isOpen={removeModal.open}
        title="Remove Reviewer"
        message="Are you sure you want to remove this reviewer?"
        confirmText="Remove"
        cancelText="Cancel"
        onCancel={() => setRemoveModal({ open: false, reviewerId: null })}
        onConfirm={confirmRemoveReviewer}
      />
    </div>
  );
};

export default ReviewerAssignment;
