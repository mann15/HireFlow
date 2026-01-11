import React, { useState } from "react";
import {
  FaUpload,
  FaFilePdf,
  FaFileWord,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import { candidateService } from "../../services/candidateService";
import {
  showSuccess,
  showError,
  getErrorMessage,
} from "../../utils/toastUtils";

const CandidateCVUpload = ({ candidateId, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
      } else {
        showError("Please select a valid file (PDF, DOC, or DOCX)");
        setFile(null);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showError("Please select a file to upload");
      return;
    }

    setLoading(true);

    try {
      const result = await candidateService.uploadCV(null, null, file);
      showSuccess("CV uploaded successfully!");
      setFile(null);

      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (err) {
      showError(getErrorMessage(err, "Failed to upload CV"));
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <FaUpload className="w-12 h-12 text-gray-400" />;

    if (file.type === "application/pdf") {
      return <FaFilePdf className="w-12 h-12 text-red-500" />;
    }
    return <FaFileWord className="w-12 h-12 text-blue-500" />;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Upload Your CV
      </h3>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          {getFileIcon()}

          {file ? (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Drag and drop your CV here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, DOC, DOCX (Max 10MB)
              </p>
            </div>
          )}

          <input
            type="file"
            id="cv-upload"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          <label
            htmlFor="cv-upload"
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
          >
            {file ? "Choose Different File" : "Choose File"}
          </label>
        </div>
      </div>

      {file && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleUpload}
            disabled={loading}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <FaCheckCircle className="mr-2" />
                Upload CV
              </>
            )}
          </button>

          <button
            onClick={() => setFile(null)}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Your CV is required before your application can
          be moved to the screening stage. Please ensure your CV is up-to-date
          and includes all relevant information.
        </p>
      </div>
    </div>
  );
};

export default CandidateCVUpload;
