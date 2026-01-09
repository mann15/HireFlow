import { useEffect, useState } from "react";
import {
  uploadDocument,
  getDocumentTypes,
} from "../../services/documentService";
import {
  getErrorMessage,
  showError,
  showSuccess,
} from "../../utils/toastUtils";

const DocumentUpload = ({ applicationId, candidateId, onUploadComplete }) => {
  const [formData, setFormData] = useState({
    documentTypeId: "",
    file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  useEffect(() => {
    const fetchTypes = async () => {
      setLoadingTypes(true);
      try {
        const types = await getDocumentTypes();
        setDocumentTypes(types || []);
      } catch (err) {
        // If we fail to load types, show a helpful error
        setError(
          err.response?.data?.error ||
            "Failed to load document types. Please contact support."
        );
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchTypes();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate applicationId
    if (!applicationId || applicationId === "undefined" || applicationId === "null") {
      showError("Invalid application ID");
      setError("Invalid application ID");
      return;
    }
    setUploading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("applicationId", applicationId);
      formDataToSend.append("candidateId", candidateId);
      formDataToSend.append("documentTypeId", formData.documentTypeId);
      formDataToSend.append("file", formData.file);

      await uploadDocument(formDataToSend);
      showSuccess("Document uploaded successfully!");
      setFormData({ documentTypeId: "", file: null });
      e.target.reset();
      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      const message = getErrorMessage(err, "Failed to upload document");
      setError(message);
      showError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Upload Document</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type *
            </label>
            <select
              value={formData.documentTypeId}
              onChange={(e) =>
                setFormData({ ...formData, documentTypeId: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
              disabled={loadingTypes || documentTypes.length === 0}
            >
              <option value="">
                {loadingTypes
                  ? "Loading document types..."
                  : documentTypes.length === 0
                  ? "No document types available"
                  : "Select Document Type"}
              </option>
              {documentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload File *
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
            </p>
          </div>

          {formData.file && (
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Selected file:</span>{" "}
                {formData.file.name}
              </p>
              <p className="text-xs text-gray-500">
                Size: {(formData.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUpload;
