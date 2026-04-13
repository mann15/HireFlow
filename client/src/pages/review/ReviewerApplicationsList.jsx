import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchApplications } from "../../redux/thunks/applicationThunks";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { reviewService, applicationService } from "../../services/apiService";

const isPendingReviewApplication = (application) => {
  const status = application?.status;
  const currentStage = application?.currentStage;

  return (
    status === "APPLIED" ||
    status === "SCREENING" ||
    status === "SCREENING_PENDING" ||
    currentStage?.includes("SCREENING") ||
    currentStage?.includes("REVIEW")
  );
};

const ReviewerApplicationsList = () => {
  const dispatch = useDispatch();
  const { applications, loading } = useSelector((state) => state.application);
  const { currentUser } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    const loadApplications = async () => {
      const role = String(
        typeof currentUser?.role === "object"
          ? currentUser?.role?.roleName || currentUser?.role?.name
          : currentUser?.role || currentUser?.roleName || "",
      )
        .replace(/^ROLE_/, "")
        .toUpperCase();

      if (role === "REVIEWER" && currentUser) {
        const reviewerId =
          currentUser.userId || currentUser.id || currentUser?.user?.id;
        const assignments = await reviewService
          .getPositionsByReviewer(reviewerId)
          .catch(() => []);
        const positionIds = assignments
          .map(
            (assignment) =>
              assignment.positionId || assignment.position?.positionId,
          )
          .filter(Boolean);

        const lists = await Promise.all(
          positionIds.map((positionId) =>
            applicationService.getApplications({ positionId }).catch(() => []),
          ),
        );

        const uniqueApplications = new Map();
        lists.flat().forEach((application) => {
          if (application?.applicationId != null) {
            uniqueApplications.set(application.applicationId, application);
          }
        });

        dispatch({
          type: "application/setApplications",
          payload: Array.from(uniqueApplications.values()),
        });
        return;
      }

      dispatch(fetchApplications({}));
    };

    loadApplications();
  }, [dispatch, currentUser]);

  const getStatusColor = (status) => {
    const colors = {
      SCREENING: "bg-purple-100 text-purple-800",
      SCREENING_PENDING: "bg-yellow-100 text-yellow-800",
      INTERVIEW: "bg-blue-100 text-blue-800",
      SELECTED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      ON_HOLD: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="text-center py-8">Loading applications...</div>;
  }

  // Filter pending screening applications
  const pendingApplications = applications.filter(isPendingReviewApplication);

  // Filter reviewed applications (those that have moved past screening)
  const reviewedApplications = applications.filter(
    (app) =>
      app.status === "INTERVIEW" ||
      app.status === "SELECTED" ||
      app.status === "REJECTED" ||
      app.status === "ON_HOLD" ||
      app.status === "WITHDRAWN",
  );

  const displayApplications =
    activeTab === "pending" ? pendingApplications : reviewedApplications;
  const tabTitle = activeTab === "pending" ? "Pending Review" : "Reviewed";

  return (
    <div className="min-h-screen px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Review Candidates
          </h1>
          <p className="text-gray-600 mt-2">
            Screen and review pending applications
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "pending"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Pending Review
                {pendingApplications.length > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {pendingApplications.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("reviewed")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "reviewed"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Previously Reviewed
                {reviewedApplications.length > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {reviewedApplications.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">{tabTitle}</h2>
            <div className="text-sm text-gray-600">
              Total: {displayApplications.length}
            </div>
          </div>

          {displayApplications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {activeTab === "pending"
                  ? "No applications to review"
                  : "No reviewed applications"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === "pending"
                  ? "There are no applications pending screening at this time."
                  : "You haven't reviewed any applications yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Candidate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Position
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Applied Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayApplications.map((app, index) => (
                    <tr
                      key={
                        app.id ||
                        `${app.positionId || "pos"}-${
                          app.candidateId || "cand"
                        }-${index}`
                      }
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">
                            {app.candidate?.firstName} {app.candidate?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {app.candidate?.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">
                          {app.position?.jobTitle || "N/A"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            app.status,
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {app.appliedAt
                          ? format(new Date(app.appliedAt), "PP")
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/review/application/${app.applicationId}`}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          {activeTab === "pending"
                            ? "Review CV"
                            : "View Review"}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewerApplicationsList;
