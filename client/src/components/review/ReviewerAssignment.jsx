import React, { useState, useEffect } from "react";
import {
  assignReviewer,
  getPositionReviewers,
  removeReviewer,
} from "../../services/reviewService";
import { getAllEmployees } from "../../services/employeeService";

const ReviewerAssignment = ({ positionId }) => {
  const [reviewers, setReviewers] = useState([]);
  const [availableReviewers, setAvailableReviewers] = useState([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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

      // Load all employees who can be reviewers (HR, Reviewers, Recruiters)
      const employees = await getAllEmployees();
      const eligibleReviewers = employees.filter(
        (emp) =>
          emp.role &&
          (emp.role.roleName === "HR" ||
            emp.role.roleName === "REVIEWER" ||
            emp.role.roleName === "RECRUITER" ||
            emp.role.roleName === "INTERVIEWER")
      );
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
    } catch (err) {
      console.error("Error assigning reviewer:", err);
      setError(err.message || "Failed to assign reviewer");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveReviewer = async (reviewerId) => {
    if (!window.confirm("Are you sure you want to remove this reviewer?")) {
      return;
    }

    try {
      await removeReviewer(positionId, reviewerId);
      await loadData();
    } catch (err) {
      console.error("Error removing reviewer:", err);
      setError(err.message || "Failed to remove reviewer");
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
                  <p className="font-medium">
                    {reviewer.reviewer?.firstName} {reviewer.reviewer?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {reviewer.reviewer?.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    Assigned on{" "}
                    {new Date(reviewer.assignedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleRemoveReviewer(reviewer.reviewer?.userId)
                  }
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
                (emp) =>
                  !reviewers.some((r) => r.reviewer?.userId === emp.userId)
              )
              .map((emp) => (
                <option key={emp.userId} value={emp.userId}>
                  {emp.firstName} {emp.lastName} - {emp.role?.roleName}
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
    </div>
  );
};

export default ReviewerAssignment;
