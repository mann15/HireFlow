import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPositionById } from "../../redux/thunks/positionThunks";
import { fetchApplications } from "../../redux/thunks/applicationThunks";
import { getPositionSkills } from "../../services/positionService";
import { getInterviewRounds } from "../../services/interviewService";
import MatchingCandidates from "../../components/positions/MatchingCandidates";
import ReviewerAssignment from "../../components/review/ReviewerAssignment";
import DefineInterviewRounds from "../../components/interviews/DefineInterviewRounds";
import {
  FiArrowLeft,
  FiEdit2,
  FiUsers,
  FiBarChart2,
  FiCalendar,
  FiUserCheck,
  FiSearch,
} from "react-icons/fi";

const PositionDetails = () => {
  const dispatch = useDispatch();
  const { id, positionId } = useParams();
  const navigate = useNavigate();
  const paramId = id || positionId;
  const { currentUser } = useSelector((state) => state.user);
  const { currentPosition, loading: positionLoading } = useSelector((state) => state.position);
  const { applications, loading: applicationLoading } = useSelector((state) => state.application);
  const userRole = currentUser?.role?.toUpperCase();
  const isCandidate = userRole === "CANDIDATE";

  const [skills, setSkills] = useState({ required: [], preferred: [] });
  const [activeTab, setActiveTab] = useState("details");
  const [interviewRounds, setInterviewRounds] = useState([]);
  const [showDefineRounds, setShowDefineRounds] = useState(false);

  useEffect(() => {
    fetchData();
  }, [paramId, isCandidate, dispatch]);

  const fetchData = async () => {
    try {
      await dispatch(fetchPositionById(paramId));
      await fetchSkills();
      // Only fetch applications, interview rounds for non-candidates
      if (!isCandidate) {
        await dispatch(fetchApplications({ positionId: paramId }));
        await fetchInterviewRounds();
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchSkills = async () => {
    try {
      const sk = await getPositionSkills(paramId);
      setSkills({
        required: sk.required || [],
        preferred: sk.preferred || [],
      });
    } catch (sErr) {
      console.warn("Could not fetch position skills", sErr);
    }
  };

  const fetchInterviewRounds = async () => {
    try {
      const data = await getInterviewRounds(paramId);
      setInterviewRounds(data || []);
    } catch (error) {
      console.error("Error fetching interview rounds:", error);
      setInterviewRounds([]);
    }
  };

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "APPLIED").length,
    screening: applications.filter((a) => a.status === "SCREENING").length,
    interview: applications.filter((a) => a.status === "INTERVIEW").length,
    selected: applications.filter((a) => a.status === "SELECTED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-800";
      case "ON_HOLD":
        return "bg-yellow-100 text-yellow-800";
      case "CLOSED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    return status ? status.replace("_", " ") : "OPEN";
  };

  const getApplicationStatusColor = (status) => {
    switch (status) {
      case "SELECTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "INTERVIEW":
        return "bg-purple-100 text-purple-800";
      case "SCREENING":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const loading = positionLoading || applicationLoading;
  const position = currentPosition;

  if (loading || !position) {
    return <div className="container p-6">Loading...</div>;
  }

  const selectedApplication = !isCandidate
    ? applications.find((a) => a.status === "SELECTED")
    : null;
  const selectedCandidate = !isCandidate
    ? position?.selectedCandidate || selectedApplication?.candidate || null
    : null;

  // Simplified view for candidates - just show position details
  if (isCandidate) {
    return (
      <div className="container mx-auto p-6 mt-20 max-w-7xl">
        <button
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          onClick={() => navigate("/positions")}
        >
          <FiArrowLeft /> Back to Positions
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {position.jobTitle}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 font-medium">
                  {position.department}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    position.status
                  )}`}
                >
                  {getStatusText(position.status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Job Description
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {position.jobDescription}
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Experience:</span>
                  <strong className="text-gray-900">
                    {position.experienceRequiredMin}-
                    {position.experienceRequiredMax} years
                  </strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Employment Type:</span>
                  <strong className="text-gray-900">
                    {position.employmentType}
                  </strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Positions:</span>
                  <strong className="text-gray-900">
                    {position.totalPositions}
                  </strong>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Salary Range
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Min:</span>
                  <strong className="text-gray-900">
                    ₹{position.salaryMin?.toLocaleString() || "0"}
                  </strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Max:</span>
                  <strong className="text-gray-900">
                    ₹{position.salaryMax?.toLocaleString() || "0"}
                  </strong>
                </div>
              </div>
            </div>

            {position.closureReason && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Closure Reason
                </h3>
                <p className="text-red-700">{position.closureReason}</p>
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Skills
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Required / Mandatory
                  </h4>
                  {skills.required.length === 0 ? (
                    <div className="text-gray-500 italic">
                      No required skills listed.
                    </div>
                  ) : (
                    <ul className="list-disc list-inside space-y-1">
                      {skills.required.map((s, i) => (
                        <li key={`req-${i}`} className="text-gray-700">
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Preferred</h4>
                  {skills.preferred.length === 0 ? (
                    <div className="text-gray-500 italic">
                      No preferred skills listed.
                    </div>
                  ) : (
                    <ul className="list-disc list-inside space-y-1">
                      {skills.preferred.map((s, i) => (
                        <li key={`pref-${i}`} className="text-gray-700">
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full view for non-candidates with all tabs and features
  const primaryColor = "var(--primary-color)";
  const primaryColorDark = "var(--primary-700)";

  return (
    <div className="container mx-auto p-6 mt-20 max-w-7xl">
      <button
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        onClick={() => navigate("/positions")}
      >
        <FiArrowLeft /> Back to Positions
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {position.jobTitle}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium">
                {position.department}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  position.status
                )}`}
              >
                {getStatusText(position.status)}
              </span>
            </div>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors shadow-sm"
            style={{ backgroundColor: primaryColor }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = primaryColorDark)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = primaryColor)
            }
            onClick={() => navigate(`/positions/${paramId}/edit`)}
          >
            <FiEdit2 /> Edit Position
          </button>
        </div>
      </div>

      {selectedCandidate && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-sm font-semibold text-green-800 mb-1">
            Selected Candidate
          </p>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <p className="text-lg font-bold text-gray-900">
                {selectedCandidate.firstName} {selectedCandidate.lastName}
              </p>
              <p className="text-sm text-gray-700">
                {selectedCandidate.email || "Email not available"}
              </p>
              {selectedCandidate.phone && (
                <p className="text-sm text-gray-700">
                  {selectedCandidate.phone}
                </p>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {selectedApplication?.applicationId && (
                <p>Application #{selectedApplication.applicationId}</p>
              )}
              {selectedCandidate.totalExperience != null && (
                <p>Experience: {selectedCandidate.totalExperience} years</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {[
          { id: "details", label: "Details", icon: null },
          {
            id: "rounds",
            label: "Interview Rounds",
            icon: <FiCalendar />,
            count: interviewRounds.length,
          },
          { id: "reviewers", label: "Reviewers", icon: <FiUserCheck /> },
          {
            id: "candidates",
            label: "Matching Candidates",
            icon: <FiSearch />,
          },
          {
            id: "applications",
            label: "Applications",
            icon: <FiUsers />,
            count: stats.total,
          },
          { id: "analytics", label: "Analytics", icon: <FiBarChart2 /> },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
              activeTab === tab.id
                ? "border-b-2"
                : "text-gray-600 hover:text-gray-900"
            }`}
            style={
              activeTab === tab.id
                ? {
                    borderColor: primaryColor,
                    color: primaryColor,
                  }
                : {}
            }
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && ` (${tab.count})`}
          </button>
        ))}
      </div>

      {activeTab === "details" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Job Description
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {position.jobDescription}
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Experience:</span>
                  <strong className="text-gray-900">
                    {position.experienceRequiredMin}-
                    {position.experienceRequiredMax} years
                  </strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Employment Type:</span>
                  <strong className="text-gray-900">
                    {position.employmentType}
                  </strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Positions:</span>
                  <strong className="text-gray-900">
                    {position.totalPositions}
                  </strong>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Salary Range
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Min:</span>
                  <strong className="text-gray-900">
                    ₹{position.salaryMin?.toLocaleString() || "0"}
                  </strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Max:</span>
                  <strong className="text-gray-900">
                    ₹{position.salaryMax?.toLocaleString() || "0"}
                  </strong>
                </div>
              </div>
            </div>

            {position.closureReason && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Closure Reason
                </h3>
                <p className="text-red-700">{position.closureReason}</p>
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Skills
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Required / Mandatory
                  </h4>
                  {skills.required.length === 0 ? (
                    <div className="text-gray-500 italic">
                      No required skills listed.
                    </div>
                  ) : (
                    <ul className="list-disc list-inside space-y-1">
                      {skills.required.map((s, i) => (
                        <li key={`req-${i}`} className="text-gray-700">
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Preferred</h4>
                  {skills.preferred.length === 0 ? (
                    <div className="text-gray-500 italic">
                      No preferred skills listed.
                    </div>
                  ) : (
                    <ul className="list-disc list-inside space-y-1">
                      {skills.preferred.map((s, i) => (
                        <li key={`pref-${i}`} className="text-gray-700">
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "rounds" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {showDefineRounds ? (
            <DefineInterviewRounds
              positionId={paramId}
              onComplete={() => {
                setShowDefineRounds(false);
                fetchInterviewRounds();
              }}
            />
          ) : (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  Interview Rounds
                </h3>
                <button
                  className="px-4 py-2 text-white rounded-lg transition-colors shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = primaryColorDark)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = primaryColor)
                  }
                  onClick={() => setShowDefineRounds(true)}
                >
                  {interviewRounds.length > 0
                    ? "Update Rounds"
                    : "Define Interview Rounds"}
                </button>
              </div>

              {interviewRounds.length === 0 ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <p className="text-yellow-800">
                    No interview rounds defined yet. Click "Define Interview
                    Rounds" to set up the interview process for this position.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {interviewRounds.map((round, index) => (
                    <div
                      key={round.roundId || index}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-lg font-semibold">
                            Round {round.roundOrder}: {round.roundName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Type: {round.roundType} | Duration:{" "}
                            {round.durationMinutes} minutes
                          </p>
                        </div>
                        {round.isMandatory && (
                          <span
                            className="px-2 py-1 text-xs rounded"
                            style={{
                              backgroundColor: "var(--primary-50)",
                              color: "var(--primary-700)",
                            }}
                          >
                            Mandatory
                          </span>
                        )}
                      </div>
                      {round.description && (
                        <p className="text-gray-700 mt-2">
                          {round.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "reviewers" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <ReviewerAssignment positionId={paramId} />
        </div>
      )}

      {activeTab === "candidates" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <MatchingCandidates positionId={paramId} />
        </div>
      )}

      {activeTab === "applications" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <span className="block text-3xl font-bold text-gray-900">
                {stats.applied}
              </span>
              <span className="text-sm text-gray-600">Applied</span>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <span
                className="block text-3xl font-bold"
                style={{ color: primaryColor }}
              >
                {stats.screening}
              </span>
              <span className="text-sm text-gray-600">Screening</span>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <span className="block text-3xl font-bold text-purple-600">
                {stats.interview}
              </span>
              <span className="text-sm text-gray-600">Interview</span>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <span className="block text-3xl font-bold text-green-600">
                {stats.selected}
              </span>
              <span className="text-sm text-gray-600">Selected</span>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <span className="block text-3xl font-bold text-red-600">
                {stats.rejected}
              </span>
              <span className="text-sm text-gray-600">Rejected</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.applicationId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {app.candidate?.firstName} {app.candidate?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.candidate?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.candidate?.totalExperience || 0} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getApplicationStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.appliedAt
                        ? new Date(app.appliedAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className="font-medium transition-colors"
                        style={{ color: primaryColor }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = primaryColorDark)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = primaryColor)
                        }
                        onClick={() =>
                          navigate(`/applications/${app.applicationId}`)
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Position Funnel
          </h3>
          <div className="space-y-4">
            {[
              {
                label: "Applied",
                value: stats.applied,
                percent: stats.applied > 0 ? 100 : 0,
                color: "bg-gray-500",
              },
              {
                label: "Screening",
                value: stats.screening,
                percent:
                  stats.applied > 0
                    ? ((stats.screening / stats.applied) * 100).toFixed(0)
                    : 0,
                color: "bg-blue-500",
              },
              {
                label: "Interview",
                value: stats.interview,
                percent:
                  stats.applied > 0
                    ? ((stats.interview / stats.applied) * 100).toFixed(0)
                    : 0,
                color: "bg-purple-500",
              },
              {
                label: "Selected",
                value: stats.selected,
                percent:
                  stats.applied > 0
                    ? ((stats.selected / stats.applied) * 100).toFixed(0)
                    : 0,
                color: "bg-green-500",
              },
            ].map((stage, idx) => (
              <div key={idx} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {stage.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    {stage.value} ({stage.percent}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-full flex items-center justify-center text-white text-sm font-medium transition-all`}
                    style={{ width: `${stage.percent}%` }}
                  >
                    {stage.percent}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionDetails;
