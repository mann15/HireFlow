import React from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import DocumentUpload from "../../components/documents/DocumentUpload";

const DocumentUploadPage = () => {
  const { applicationId } = useParams();
  const { currentUser } = useSelector((state) => state.user);

  const candidateId =
    currentUser?.candidateId || currentUser?.id || currentUser?.userId;

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
