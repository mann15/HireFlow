import { useState, useEffect } from "react";
import { getApplicationById } from "../../services/applicationService";
import {
  moveToScreening,
  moveToInterview,
  moveToHold,
  rejectApplication,
  selectCandidate,
} from "../../services/applicationService";
import { format } from "date-fns";

const ApplicationStatusManager = ({ applicationId, onUpdate }) => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const data = await getApplicationById(applicationId);
      setApplication(data);
    } catch (err) {
      console.error("Failed to fetch application:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, needsReason = false) => {
    if (needsReason && !reason.trim()) {
      alert("Please provide a reason");
      return;
    }

    setActionLoading(true);
    try {
      switch (action) {
        case "SCREENING":
          await moveToScreening(applicationId);
          break;
        case "INTERVIEW":
          await moveToInterview(applicationId);
          break;
        case "HOLD":
          await moveToHold(applicationId, reason);
          setShowHoldModal(false);
          setReason("");
          break;
        case "REJECT":
          await rejectApplication(applicationId, reason);
          setShowRejectModal(false);
          setReason("");
          break;
        case "SELECT":
          if (
            window.confirm("Are you sure you want to select this candidate?")
          ) {
            await selectCandidate(applicationId);
          }
          break;
      }
      alert("Application status updated successfully!");
      await fetchApplication();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update application");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      APPLIED: "bg-blue-100 text-blue-800",
      SCREENING: "bg-purple-100 text-purple-800",
      INTERVIEW: "bg-yellow-100 text-yellow-800",
      SELECTED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      ON_HOLD: "bg-gray-100 text-gray-800",
      WITHDRAWN: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!application) {
    return (
      <div className="text-center py-8 text-red-600">Application not found</div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Application Status Manager</h2>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Current Status</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                application.status
              )}`}
            >
              {application.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Stage</p>
            <p className="font-medium">{application.currentStage}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Applied Date</p>
            <p className="font-medium">
              {application.appliedDate
                ? format(new Date(application.appliedDate), "PPP")
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="font-medium">
              {application.lastUpdated
                ? format(new Date(application.lastUpdated), "PPP")
                : "N/A"}
            </p>
          </div>
        </div>

        {application.remarks && (
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">Remarks</p>
            <p className="font-medium">{application.remarks}</p>
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Available Actions</h3>
        <div className="flex flex-wrap gap-3">
          {application.status === "APPLIED" && (
            <button
              onClick={() => handleAction("SCREENING")}
              disabled={actionLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
            >
              Move to Screening
            </button>
          )}

          {application.status === "SCREENING" && (
            <button
              onClick={() => handleAction("INTERVIEW")}
              disabled={actionLoading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400"
            >
              Move to Interview
            </button>
          )}

          {application.status === "INTERVIEW" && (
            <button
              onClick={() => handleAction("SELECT")}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              Select Candidate
            </button>
          )}

          {!["SELECTED", "REJECTED", "WITHDRAWN"].includes(
            application.status
          ) && (
            <>
              <button
                onClick={() => setShowHoldModal(true)}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
              >
                Put on Hold
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Reject Application</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
              rows="4"
              placeholder="Reason for rejection..."
              required
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setReason("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction("REJECT", true)}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
              >
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hold Modal */}
      {showHoldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Put Application on Hold</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
              rows="4"
              placeholder="Reason for holding..."
              required
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowHoldModal(false);
                  setReason("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction("HOLD", true)}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
              >
                {actionLoading ? "Processing..." : "Confirm Hold"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationStatusManager;
