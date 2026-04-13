import PendingDocumentsQueue from "../../components/documents/PendingDocumentsQueue";

const DocumentVerificationPage = () => {
  return (
    <div className="min-h-screen px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Document Verification
          </h1>
          <p className="text-gray-600 mt-2">
            Review and verify candidate documents
          </p>
        </div>
        <PendingDocumentsQueue />
      </div>
    </div>
  );
};

export default DocumentVerificationPage;
