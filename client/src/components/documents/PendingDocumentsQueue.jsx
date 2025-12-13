import { useState, useEffect } from "react";
import { getPendingDocuments } from "../../services/documentService";
import { verifyDocument } from "../../services/documentService";
import { format } from "date-fns";

const PendingDocumentsQueue = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [verifyData, setVerifyData] = useState({
    status: "VERIFIED",
    remarks: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingDocuments();
  }, []);

  const fetchPendingDocuments = async () => {
    setLoading(true);
    try {
      const data = await getPendingDocuments();
      setDocuments(data);
    } catch (err) {
      console.error("Failed to fetch pending documents:", err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (documentId) => {
    setActionLoading(true);
    try {
      await verifyDocument(documentId, verifyData.status, verifyData.remarks);
      alert("Document verified successfully!");
      setSelectedDoc(null);
      setVerifyData({ status: "VERIFIED", remarks: "" });
      await fetchPendingDocuments();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to verify document");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading pending documents...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Pending Document Verification</h2>
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
          {documents.length} Pending
        </span>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No pending documents for verification
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border border-yellow-200 bg-yellow-50 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {doc.documentTypeName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Candidate: {doc.candidateName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Position: {doc.positionTitle}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded:{" "}
                    {doc.uploadedDate
                      ? format(new Date(doc.uploadedDate), "PPP")
                      : "N/A"}
                  </p>
                </div>
                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  PENDING
                </span>
              </div>

              {doc.documentUrl && (
                <div className="mb-3">
                  <a
                    href={doc.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    📄 View Document
                  </a>
                </div>
              )}

              {selectedDoc === doc.id ? (
                <div className="mt-4 pt-4 border-t space-y-3">
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
                        setVerifyData({
                          ...verifyData,
                          remarks: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      rows="2"
                      placeholder="Add verification remarks..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerify(doc.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {actionLoading ? "Saving..." : "Save Verification"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDoc(null);
                        setVerifyData({ status: "VERIFIED", remarks: "" });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedDoc(doc.id)}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Review & Verify
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingDocumentsQueue;
