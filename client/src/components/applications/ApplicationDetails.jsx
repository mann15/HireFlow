import { useState, useEffect } from "react";
import { getApplicationById } from "../../services/applicationService";
import ApplicationStatusManager from "./ApplicationStatusManager";
import InterviewsList from "../interviews/InterviewsList";
import { format } from "date-fns";

const ApplicationDetails = ({ applicationId }) => {
  const [application, setApplication] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (applicationId && applicationId !== "undefined" && applicationId !== "null") {
      fetchApplication();
    }
  }, [applicationId]);

  const fetchApplication = async () => {
    if (!applicationId || applicationId === "undefined" || applicationId === "null") {
      return;
    }
    setLoading(true);
    try {
      const data = await getApplicationById(applicationId);
      setApplication(data);
    } catch (err) {
      console.error("Failed to fetch application:", err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "status", label: "Status Management" },
    { id: "interviews", label: "Interviews" },
    { id: "documents", label: "Documents" },
    { id: "offers", label: "Offers" },
  ];

  if (loading) {
    return (
      <div className="text-center py-8">Loading application details...</div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-8 text-red-600">Application not found</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {application.candidateName}
            </h1>
            <p className="text-gray-600 mb-1">{application.candidateEmail}</p>
            <p className="text-gray-600">{application.positionTitle}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Application ID</p>
            <p className="font-mono text-lg">{application.id}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-semibold text-lg">{application.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Stage</p>
            <p className="font-semibold text-lg">{application.currentStage}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Applied Date</p>
            <p className="font-semibold text-lg">
              {application.appliedDate
                ? format(new Date(application.appliedDate), "PP")
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="font-semibold text-lg">
              {application.lastUpdated
                ? format(new Date(application.lastUpdated), "PP")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Application Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Candidate ID</p>
                  <p className="font-medium">{application.candidateId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Position ID</p>
                  <p className="font-medium">{application.positionId}</p>
                </div>
                {application.remarks && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Remarks</p>
                    <p className="font-medium">{application.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "status" && (
            <ApplicationStatusManager
              applicationId={applicationId}
              onUpdate={fetchApplication}
            />
          )}

          {activeTab === "interviews" && (
            <InterviewsList applicationId={applicationId} />
          )}

          {activeTab === "documents" && (
            <div className="text-center py-8 text-gray-500">
              Document management will be displayed here
            </div>
          )}

          {activeTab === "offers" && (
            <div className="text-center py-8 text-gray-500">
              Offer management will be displayed here
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
