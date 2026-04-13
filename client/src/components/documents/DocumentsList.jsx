import { useState, useEffect } from "react";
import { getDocumentsByApplication } from "../../services/documentService";
import { verifyDocument } from "../../services/documentService";
import { format } from "date-fns";
import {
  getErrorMessage,
  showError,
  showSuccess,
} from "../../utils/toastUtils";

const DocumentsList = ({ applicationId, isHR = false, onUpdate }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyModal, setVerifyModal] = useState({
    show: false,
    document: null,
  });
  const [verifyData, setVerifyData] = useState({
    status: "VERIFIED",
    remarks: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [applicationId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await getDocumentsByApplication(applicationId);
      setDocuments(data);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setActionLoading(true);
    try {
      await verifyDocument(
        verifyModal.document.id,
        verifyData.status,
        verifyData.remarks,
      );
      showSuccess("Document status updated successfully!");
      setVerifyModal({ show: false, document: null });
      setVerifyData({ status: "VERIFIED", remarks: "" });
      await fetchDocuments();
      if (onUpdate) onUpdate();
    } catch (err) {
      showError(getErrorMessage(err, "Failed to update document status"));
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      VERIFIED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      SUGGESTION: "bg-blue-100 text-blue-800",
      RESUBMIT: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getDocumentTypeName = (doc) =>
    doc?.documentTypeName || doc?.documentType?.name || "Unknown Document";

  const getUploadedDate = (doc) => doc?.uploadedDate || doc?.uploadedAt;

  const getVerificationStatus = (doc) =>
    doc?.verificationStatus || doc?.status || "PENDING";

  const getVerifiedDate = (doc) => doc?.verifiedDate || doc?.verifiedAt;

  if (loading) {
    return <div className="text-center py-8">Loading documents...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Documents</h2>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No documents uploaded yet
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    {getDocumentTypeName(doc)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Uploaded:{" "}
                    {getUploadedDate(doc)
                      ? format(new Date(getUploadedDate(doc)), "PPP")
                      : "N/A"}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    getVerificationStatus(doc),
                  )}`}
                >
                  {getVerificationStatus(doc)}
                </span>
              </div>

              {doc.documentUrl && (
                <div className="mb-3">
                  <a
                    href={doc.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Document
                  </a>
                </div>
              )}

              {doc.remarks && (
                <div className="bg-gray-50 p-3 rounded mb-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Remarks:</span> {doc.remarks}
                  </p>
                </div>
              )}

              {getVerifiedDate(doc) && (
                <p className="text-xs text-gray-500">
                  Verified on: {format(new Date(getVerifiedDate(doc)), "PPP")}
                </p>
              )}

              {isHR && getVerificationStatus(doc) === "PENDING" && (
                <div className="mt-3 pt-3 border-t">
                  <button
                    onClick={() =>
                      setVerifyModal({ show: true, document: doc })
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Review Document
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Verify Modal */}
      {verifyModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              Verify Document: {verifyModal.document?.documentTypeName}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Status *
                </label>
                <select
                  value={verifyData.status}
                  onChange={(e) =>
                    setVerifyData({ ...verifyData, status: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="SUGGESTION">Suggestion</option>
                  <option value="RESUBMIT">Request Resubmit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  value={verifyData.remarks}
                  onChange={(e) =>
                    setVerifyData({ ...verifyData, remarks: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows="3"
                  placeholder="Add any remarks or feedback..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setVerifyModal({ show: false, document: null });
                  setVerifyData({ status: "VERIFIED", remarks: "" });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {actionLoading ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsList;
