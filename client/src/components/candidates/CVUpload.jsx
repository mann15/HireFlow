import React, { useState } from "react";
import { candidateService } from "../../services/candidateService";

const CVUpload = ({ candidateId, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [positionId, setPositionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type === "application/msword" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Please select a valid file (PDF, DOC, or DOCX)");
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    if (!positionId) {
      setError("Please select a position");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await candidateService.uploadCV(
        candidateId,
        positionId,
        file
      );
      setSuccess("CV uploaded successfully");
      setFile(null);
      setPositionId("");

      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (err) {
      setError(err.error || "Failed to upload CV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload CV</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select CV File
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position ID
          </label>
          <input
            type="number"
            value={positionId}
            onChange={(e) => setPositionId(e.target.value)}
            placeholder="Enter position ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {file && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">Selected file: {file.name}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || !positionId || loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload CV"}
        </button>

        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">Supported formats:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>PDF (.pdf)</li>
            <li>Microsoft Word (.doc)</li>
            <li>Microsoft Word (.docx)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CVUpload;
