import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getPositionById,
  getApplicationsByPosition,
  getPositionSkills,
} from "../../services/positionService";
import MatchingCandidates from "../../components/positions/MatchingCandidates";
import ApplicationsTable from "../../components/applications/ApplicationsTable";
import ReviewerAssignment from "../../components/review/ReviewerAssignment";

const PositionDetails = () => {
  const { id } = useParams();
  const [position, setPosition] = useState(null);
  const [applications, setApplications] = useState([]);
  const [skills, setSkills] = useState({ required: [], preferred: [] });
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    fetch();
  }, [id]);

  const fetch = async () => {
    try {
      const pos = await getPositionById(id);
      setPosition(pos);
      const apps = await getApplicationsByPosition(id);
      setApplications(apps || []);
      // fetch skills (required / preferred)
      try {
        const sk = await getPositionSkills(id);
        // backend returns { required: [...], preferred: [...] }
        setSkills({
          required: sk.required || [],
          preferred: sk.preferred || [],
        });
      } catch (sErr) {
        console.warn("Could not fetch position skills", sErr);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!position) return <div className="container p-6">Loading...</div>;

  const selectedApplication = applications.find((a) => a.status === "SELECTED");
  const selectedCandidate =
    position?.selectedCandidate || selectedApplication?.candidate || null;

  return (
    <div className="container mx-auto p-6 mt-20">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold">{position.jobTitle}</h2>
          <p className="text-sm text-gray-600">
            Status: {position.status || "OPEN"}
          </p>
        </div>

        <div className="space-x-2">
          <Link
            to={`/positions/${position.positionId}/edit`}
            className="px-3 py-1 rounded bg-yellow-500 text-white"
          >
            Edit
          </Link>
          <Link
            to={`/positions/${position.positionId}/applications`}
            className="px-3 py-1 rounded bg-blue-600 text-white"
          >
            Applications ({applications.length})
          </Link>
          <Link
            to={`/positions/${position.positionId}/analytics`}
            className="px-3 py-1 rounded bg-green-600 text-white"
          >
            Analytics
          </Link>
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

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-2 px-4 font-medium ${
              activeTab === "details"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Position Details
          </button>
          <button
            onClick={() => setActiveTab("reviewers")}
            className={`py-2 px-4 font-medium ${
              activeTab === "reviewers"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Reviewers
          </button>
          <button
            onClick={() => setActiveTab("matching")}
            className={`py-2 px-4 font-medium ${
              activeTab === "matching"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Matching Candidates
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`py-2 px-4 font-medium ${
              activeTab === "applications"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Applications ({applications.length})
          </button>
        </div>
      </div>

      {/* Details Tab */}
      {activeTab === "details" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium">Description</h3>
              <p className="whitespace-pre-wrap">{position.jobDescription}</p>
            </div>

            <div>
              <h3 className="font-medium">Details</h3>
              <ul className="text-sm text-gray-700 mt-2 space-y-2">
                <li>
                  <strong>Department:</strong> {position.department || "-"}
                </li>
                <li>
                  <strong>Employment Type:</strong>{" "}
                  {position.employmentType || "-"}
                </li>
                <li>
                  <strong>Experience:</strong>{" "}
                  {position.experienceRequiredMin ?? 0} -{" "}
                  {position.experienceRequiredMax ?? 0} years
                </li>
                <li>
                  <strong>Salary Range:</strong>{" "}
                  {position.salaryMin != null || position.salaryMax != null ? (
                    <span>
                      {position.salaryMin != null
                        ? `$${position.salaryMin}`
                        : "-"}{" "}
                      {" - "}
                      {position.salaryMax != null
                        ? `$${position.salaryMax}`
                        : "-"}
                    </span>
                  ) : (
                    <span>-</span>
                  )}
                </li>
                <li>
                  <strong>Total Positions:</strong>{" "}
                  {position.totalPositions || 0}
                </li>
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Skills</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium">Required / Mandatory</h4>
                {skills.required.length === 0 ? (
                  <div className="text-gray-500">
                    No required skills listed.
                  </div>
                ) : (
                  <ul className="list-disc list-inside">
                    {skills.required.map((s, i) => (
                      <li key={`req-${i}`}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h4 className="font-medium">Preferred</h4>
                {skills.preferred.length === 0 ? (
                  <div className="text-gray-500">
                    No preferred skills listed.
                  </div>
                ) : (
                  <ul className="list-disc list-inside">
                    {skills.preferred.map((s, i) => (
                      <li key={`pref-${i}`}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Recent Applications</h3>
            {applications.length === 0 ? (
              <div className="text-gray-500">No applications yet.</div>
            ) : (
              <ul className="space-y-2">
                {applications.slice(0, 5).map((a) => (
                  <li key={a.applicationId} className="border p-3 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {a.candidate?.firstName} {a.candidate?.lastName}
                        </div>
                        <div className="text-sm text-gray-600">{a.status}</div>
                      </div>
                      <span className="text-sm text-gray-500">
                        Application #{a.applicationId}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* Reviewers Tab */}
      {activeTab === "reviewers" && <ReviewerAssignment positionId={id} />}

      {/* Matching Candidates Tab */}
      {activeTab === "matching" && <MatchingCandidates positionId={id} />}

      {/* Applications Tab */}
      {activeTab === "applications" && <ApplicationsTable positionId={id} />}
    </div>
  );
};

export default PositionDetails;
