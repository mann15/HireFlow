import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getApplicationById } from "../../services/applicationService";
import ApplicationStatusManager from "../../components/applications/ApplicationStatusManager";
import InterviewsList from "../../components/interviews/InterviewsList";
import DocumentsList from "../../components/documents/DocumentsList";
import DocumentUpload from "../../components/documents/DocumentUpload";
import OffersList from "../../components/offers/OffersList";
import GenerateOffer from "../../components/offers/GenerateOffer";
import ScheduleInterview from "../../components/interviews/ScheduleInterview";
import CreateEmployee from "../../components/employees/CreateEmployee";
import CVReviewPanel from "../../components/review/CVReviewPanel";
import FinalSelectionPanel from "../../components/applications/FinalSelectionPanel";

const ApplicationDetailsPage = () => {
  const { applicationId } = useParams();
  const [application, setApplication] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showScheduleInterview, setShowScheduleInterview] = useState(false);
  const [showGenerateOffer, setShowGenerateOffer] = useState(false);
  const [showUploadDocument, setShowUploadDocument] = useState(false);
  const [showCreateEmployee, setShowCreateEmployee] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      const data = await getApplicationById(applicationId);
      setApplication(data);
    } catch (err) {
      console.error("Failed to fetch application:", err);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "review", label: "CV Review" },
    { id: "status", label: "Status Management" },
    { id: "interviews", label: "Interviews" },
    { id: "documents", label: "Documents" },
    { id: "offers", label: "Offers" },
    { id: "finalize", label: "Final Selection" },
  ];

  if (!application) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          Loading application details...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">Application Details</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Candidate</p>
              <p className="font-semibold text-lg">
                {application.candidateName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Position</p>
              <p className="font-semibold text-lg">
                {application.positionTitle}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold text-lg">{application.status}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowScheduleInterview(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Schedule Interview
                  </button>
                  <button
                    onClick={() => setShowGenerateOffer(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Generate Offer
                  </button>
                  <button
                    onClick={() => setShowUploadDocument(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Upload Document
                  </button>
                  <button
                    onClick={() => setShowCreateEmployee(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Create Employee Record
                  </button>
                </div>
              </div>
            )}

            {activeTab === "review" && (
              <CVReviewPanel
                applicationId={applicationId}
                onUpdate={fetchApplication}
              />
            )}

            {activeTab === "status" && (
              <ApplicationStatusManager
                applicationId={applicationId}
                onUpdate={fetchApplication}
              />
            )}

            {activeTab === "interviews" && (
              <div>
                <div className="mb-4">
                  <button
                    onClick={() => setShowScheduleInterview(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Schedule New Interview
                  </button>
                </div>
                <InterviewsList applicationId={applicationId} />
              </div>
            )}

            {activeTab === "documents" && (
              <div>
                <div className="mb-4">
                  <button
                    onClick={() => setShowUploadDocument(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Upload Document
                  </button>
                </div>
                <DocumentsList applicationId={applicationId} isHR={true} />
              </div>
            )}

            {activeTab === "offers" && (
              <div>
                <div className="mb-4">
                  <button
                    onClick={() => setShowGenerateOffer(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Generate New Offer
                  </button>
                </div>
                <OffersList applicationId={applicationId} isHR={true} />
              </div>
            )}

            {activeTab === "finalize" && (
              <FinalSelectionPanel
                application={application}
                onRefresh={fetchApplication}
              />
            )}
          </div>
        </div>

        {/* Modals */}
        {showScheduleInterview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <ScheduleInterview
                applicationId={application.id}
                positionId={application.positionId}
                candidateName={application.candidateName}
                onComplete={() => {
                  setShowScheduleInterview(false);
                  fetchApplication();
                }}
              />
            </div>
          </div>
        )}

        {showGenerateOffer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <GenerateOffer
                applicationId={application.id}
                candidateName={application.candidateName}
                positionTitle={application.positionTitle}
                onComplete={() => {
                  setShowGenerateOffer(false);
                  fetchApplication();
                }}
              />
            </div>
          </div>
        )}

        {showUploadDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <DocumentUpload
                applicationId={application.id}
                candidateId={application.candidateId}
                onUploadComplete={() => {
                  setShowUploadDocument(false);
                  fetchApplication();
                }}
              />
            </div>
          </div>
        )}

        {showCreateEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CreateEmployee
                candidateId={application.candidateId}
                applicationId={application.id}
                candidateName={application.candidateName}
                onComplete={() => {
                  setShowCreateEmployee(false);
                  fetchApplication();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationDetailsPage;
