import React from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import DocumentUpload from "../../components/documents/DocumentUpload";

const DocumentUploadPage = () => {
  const { applicationId } = useParams();
  const { currentUser } = useSelector((state) => state.user);

  const candidateId =
    currentUser?.candidateId || currentUser?.id || currentUser?.userId;

  // Validate applicationId
  if (!applicationId || applicationId === "undefined" || applicationId === "null") {
    return (
      <div className="min-h-screen pt-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">Invalid application ID. Please navigate from a valid application.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
          <p className="text-gray-600 mt-2">
            Submit required documents for your application. HR will verify and
            update background check status.
          </p>
        </div>
        <DocumentUpload
          applicationId={applicationId}
          candidateId={candidateId}
          onUploadComplete={() => {}}
        />
      </div>
    </div>
  );
};

export default DocumentUploadPage;
