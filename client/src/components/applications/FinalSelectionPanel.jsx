import { useEffect, useState } from "react";
import DocumentsList from "../documents/DocumentsList";
import DocumentUpload from "../documents/DocumentUpload";
import OffersList from "../offers/OffersList";
import GenerateOffer from "../offers/GenerateOffer";
import {
  selectCandidate,
  updateBackgroundVerification,
  confirmJoining,
} from "../../services/applicationService";
import { createEmployee } from "../../services/employeeService";

// Final selection hub: document verification, background check status,
// offer issuance, joining confirmation, and hand-off to employee records.
const FinalSelectionPanel = ({ application, onRefresh }) => {
  const [joiningDate, setJoiningDate] = useState("");
  const [bgStatus, setBgStatus] = useState("PENDING");
  const [bgRemarks, setBgRemarks] = useState("");
  const [savingBg, setSavingBg] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [creatingEmployee, setCreatingEmployee] = useState(false);
  const [showOffer, setShowOffer] = useState(false);

  useEffect(() => {
    if (application?.backgroundVerificationStatus) {
      setBgStatus(application.backgroundVerificationStatus);
    }
    if (application?.joiningDate) {
      setJoiningDate(application.joiningDate.split("T")[0]);
    }
  }, [application]);

  const handleBgSave = async () => {
    setSavingBg(true);
    try {
      await updateBackgroundVerification(application.id, bgStatus, bgRemarks);
      alert("Background verification status updated");
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Failed to update background verification status"
      );
    } finally {
      setSavingBg(false);
    }
  };

  const handleFinalizeSelection = async () => {
    if (!joiningDate) {
      alert("Please set a joining date before finalizing selection.");
      return;
    }

    setSelecting(true);
    try {
      await selectCandidate(application.id);
      await confirmJoining(application.id, joiningDate);
      alert("Candidate marked as selected with joining date.");
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to finalize selection");
    } finally {
      setSelecting(false);
    }
  };

  const handleCreateEmployee = async () => {
    if (!joiningDate) {
      alert("Set a joining date first.");
      return;
    }
    setCreatingEmployee(true);
    try {
      await createEmployee({
        candidateId: application.candidateId,
        positionId: application.positionId,
        designation: application.positionTitle,
        department: application.department || "Engineering",
        joiningDate,
        salary: application.offerSalary || 0,
        offerId: application.offerId || null,
      });
      alert("Employee record created and candidate moved to employees.");
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create employee record");
    } finally {
      setCreatingEmployee(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DocumentUpload
          applicationId={application.id}
          candidateId={application.candidateId}
          onUploadComplete={onRefresh}
        />
        <DocumentsList
          applicationId={application.id}
          isHR={true}
          onUpdate={onRefresh}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">Background Verification</h3>
            <p className="text-sm text-gray-600">
              Track and lock status before issuing final offer.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={bgStatus}
              onChange={(e) => setBgStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="VERIFIED">Verified</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              value={bgRemarks}
              onChange={(e) => setBgRemarks(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows="2"
              placeholder="Background check notes, vendor refs, pending docs..."
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleBgSave}
            disabled={savingBg}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {savingBg ? "Saving..." : "Save BG Status"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold">Final Offer & Joining</h3>
            <p className="text-sm text-gray-600">
              Issue offers, set joining, and move to employee records.
            </p>
          </div>
          <button
            onClick={() => setShowOffer(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Generate Offer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Joining Date
            </label>
            <input
              type="date"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleFinalizeSelection}
              disabled={selecting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {selecting ? "Saving..." : "Mark Selected"}
            </button>
            <button
              onClick={handleCreateEmployee}
              disabled={creatingEmployee}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
            >
              {creatingEmployee ? "Creating..." : "Move to Employees"}
            </button>
          </div>
        </div>

        <OffersList applicationId={application.id} isHR={true} />
      </div>

      {showOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <GenerateOffer
              applicationId={application.id}
              candidateName={application.candidateName}
              positionTitle={application.positionTitle}
              onComplete={() => {
                setShowOffer(false);
                if (onRefresh) onRefresh();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalSelectionPanel;
