import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchApplicationById } from "../../redux/thunks/applicationThunks";
import ApplicationStatusManager from "../../components/applications/ApplicationStatusManager";
import InterviewsList from "../../components/interviews/InterviewsList";
import DocumentsList from "../../components/documents/DocumentsList";
import DocumentUpload from "../../components/documents/DocumentUpload";
import { Link } from "react-router-dom";
import OffersList from "../../components/offers/OffersList";
import GenerateOffer from "../../components/offers/GenerateOffer";
import ScheduleInterview from "../../components/interviews/ScheduleInterview";
import CreateEmployee from "../../components/employees/CreateEmployee";
import CVReviewPanel from "../../components/review/CVReviewPanel";
import FinalSelectionPanel from "../../components/applications/FinalSelectionPanel";
import { FiArrowLeft } from "react-icons/fi";
import { showError } from "../../utils/toastUtils";

const ApplicationDetailsPage = () => {
  const dispatch = useDispatch();
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const { currentApplication, loading } = useSelector((state) => state.application);
  const userRole = currentUser?.role?.toUpperCase();
  const isCandidate = userRole === "CANDIDATE";

  const [activeTab, setActiveTab] = useState("overview");
  const [showScheduleInterview, setShowScheduleInterview] = useState(false);
  const [showGenerateOffer, setShowGenerateOffer] = useState(false);
  const [showUploadDocument, setShowUploadDocument] = useState(false);
  const [showCreateEmployee, setShowCreateEmployee] = useState(false);

  useEffect(() => {
    if (applicationId && applicationId !== "undefined") {
      dispatch(fetchApplicationById(applicationId));
    }
  }, [dispatch, applicationId]);

  // Refresh helper used by child components and modals
  const fetchApplication = async () => {
    if (!applicationId || applicationId === "undefined") {
      showError("Invalid application ID");
      return;
    }
    try {
      await dispatch(fetchApplicationById(applicationId)).unwrap();
    } catch (err) {
      showError("Failed to refresh application details");
    }
  };

  const application = currentApplication;

  const tabs = isCandidate
    ? [
        { id: "overview", label: "Overview" },
        { id: "interviews", label: "Interviews" },
        { id: "documents", label: "Documents" },
      ]
    : [
        { id: "overview", label: "Overview" },
        { id: "review", label: "CV Review" },
        { id: "status", label: "Status Management" },
        { id: "interviews", label: "Interviews" },
        { id: "documents", label: "Documents" },
        { id: "offers", label: "Offers" },
        { id: "finalize", label: "Final Selection" },
      ];

  if (loading || !application) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          {loading ? "Loading application details..." : "Application not found"}
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-red-600 mb-4">Application not found</p>
          <button
            onClick={() =>
              navigate(isCandidate ? "/candidate/dashboard" : "/applications")
            }
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Back Button for Candidates */}
        {isCandidate && (
          <button
            onClick={() => navigate("/candidate/dashboard")}
            className="mb-4 flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </button>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">Application Details</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Candidate</p>
              <p className="font-semibold text-lg">
                {application.candidate.firstName}{" "}
                {application.candidate.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Position</p>
              <p className="font-semibold text-lg">
                {application.position.jobTitle}
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
              <div className="space-y-6">
                {/* Process Flow Visualization */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Recruitment Process Flow
                  </h3>
                  <div className="flex items-center justify-between relative">
                    {[
                      {
                        stage: "APPLIED",
                        label: "Applied",
                        activeClass:
                          "bg-blue-600 text-white ring-4 ring-blue-200",
                        completedClass: "bg-blue-500 text-white",
                        textActive: "text-blue-600",
                        textCompleted: "text-blue-500",
                        lineCompleted: "bg-blue-500",
                      },
                      {
                        stage: "SCREENING",
                        label: "Screening",
                        activeClass:
                          "bg-purple-600 text-white ring-4 ring-purple-200",
                        completedClass: "bg-purple-500 text-white",
                        textActive: "text-purple-600",
                        textCompleted: "text-purple-500",
                        lineCompleted: "bg-purple-500",
                      },
                      {
                        stage: "INTERVIEW",
                        label: "Interview",
                        activeClass:
                          "bg-yellow-600 text-white ring-4 ring-yellow-200",
                        completedClass: "bg-yellow-500 text-white",
                        textActive: "text-yellow-600",
                        textCompleted: "text-yellow-500",
                        lineCompleted: "bg-yellow-500",
                      },
                      {
                        stage: "SELECTED",
                        label: "Selected",
                        activeClass:
                          "bg-green-600 text-white ring-4 ring-green-200",
                        completedClass: "bg-green-500 text-white",
                        textActive: "text-green-600",
                        textCompleted: "text-green-500",
                        lineCompleted: "bg-green-500",
                      },
                    ].map((step, index) => {
                      const isActive = application.status === step.stage;
                      const isCompleted =
                        (step.stage === "APPLIED" &&
                          ["SCREENING", "INTERVIEW", "SELECTED"].includes(
                            application.status
                          )) ||
                        (step.stage === "SCREENING" &&
                          ["INTERVIEW", "SELECTED"].includes(
                            application.status
                          )) ||
                        (step.stage === "INTERVIEW" &&
                          application.status === "SELECTED");

                      return (
                        <React.Fragment key={step.stage}>
                          <div className="flex flex-col items-center flex-1">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm ${
                                isActive
                                  ? step.activeClass
                                  : isCompleted
                                  ? step.completedClass
                                  : "bg-gray-200 text-gray-500"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <p
                              className={`text-xs mt-2 font-medium ${
                                isActive
                                  ? step.textActive
                                  : isCompleted
                                  ? step.textCompleted
                                  : "text-gray-400"
                              }`}
                            >
                              {step.label}
                            </p>
                            {isActive && (
                              <p className="text-xs text-gray-500 mt-1">
                                Current
                              </p>
                            )}
                          </div>
                          {index < 3 && (
                            <div
                              className={`flex-1 h-1 mx-2 ${
                                isCompleted ? step.lineCompleted : "bg-gray-200"
                              }`}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Actions - Only for non-candidates */}
                {!isCandidate && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Quick Actions
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {application.status === "SCREENING" && (
                        <Link
                          to={`/applications/${applicationId}#review`}
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                          Review CV
                        </Link>
                      )}
                      {["SCREENING", "INTERVIEW"].includes(
                        application.status
                      ) && (
                        <button
                          onClick={() => setShowScheduleInterview(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Schedule Interview
                        </button>
                      )}
                      {application.status === "SELECTED" && (
                        <>
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
                          <Link
                            to={`/applications/${applicationId}/documents`}
                            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
                          >
                            Go to Document Portal
                          </Link>
                        </>
                      )}
                      {application.status === "SELECTED" && (
                        <button
                          onClick={() => setShowCreateEmployee(true)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Create Employee Record
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "review" && !isCandidate && (
              <CVReviewPanel
                applicationId={applicationId}
                onUpdate={fetchApplication}
              />
            )}

            {activeTab === "status" && !isCandidate && (
              <ApplicationStatusManager
                applicationId={applicationId}
                onUpdate={fetchApplication}
              />
            )}

            {activeTab === "interviews" && (
              <div>
                {!isCandidate && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowScheduleInterview(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Schedule New Interview
                    </button>
                  </div>
                )}
                <InterviewsList
                  applicationId={applicationId}
                  isCandidate={isCandidate}
                />
              </div>
            )}

            {activeTab === "documents" && (
              <div>
                {!isCandidate ? (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowUploadDocument(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Upload Document
                    </button>
                    <Link
                      to={`/applications/${applicationId}/documents`}
                      className="ml-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
                    >
                      Open Document Portal
                    </Link>
                  </div>
                ) : (
                  // Show upload button only for SELECTED status candidates
                  (application.status === "SELECTED" ||
                    application.status === "HIRED") && (
                    <div className="mb-4">
                      <button
                        onClick={() => setShowUploadDocument(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      >
                        Upload Document
                      </button>
                      <Link
                        to={`/applications/${applicationId}/documents`}
                        className="ml-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
                      >
                        Open Document Portal
                      </Link>
                    </div>
                  )
                )}
                <DocumentsList
                  applicationId={applicationId}
                  isHR={!isCandidate}
                  isCandidate={isCandidate}
                />
              </div>
            )}

            {activeTab === "offers" && !isCandidate && (
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

            {activeTab === "finalize" && !isCandidate && (
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
