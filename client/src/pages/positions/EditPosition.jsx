import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getPositionById,
  updatePosition,
  updatePositionStatus,
  closePosition,
  getPositionSkills,
  updatePositionSkills,
  getApplicationsByPosition,
} from "../../services/positionService";
import Loader from "../../components/Loader";

const EditPosition = () => {
  const { id } = useParams();
  const [position, setPosition] = useState(null);
  const [skills, setSkills] = useState({ required: [], preferred: [] });
  const [statusReason, setStatusReason] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [applications, setApplications] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]); // multi-select
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPosition = async () => {
      try {
        setLoading(true);
        setError(null);
        const p = await getPositionById(id);
        setPosition(p);
        const positionSkills = await getPositionSkills(id);
        setSkills(positionSkills || { required: [], preferred: [] });
        // load applications for multi-select when closing
        try {
          const apps = await getApplicationsByPosition(id);
          setApplications(apps || []);
        } catch (aErr) {
          console.warn("Failed to load applications for position", aErr);
        }
      } catch (err) {
        setError(err.message || "Failed to load position");
      } finally {
        setLoading(false);
      }
    };
    loadPosition();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields based on status
    if (position.status !== "OPEN" && !statusReason.trim()) {
      setError("Reason is required when changing position status");
      return;
    }

    if (showConfirmDialog) {
      setShowConfirmDialog(false);
      try {
        setSaving(true);
        setError(null);

        // Update basic position details
        await updatePosition(id, position);

        // Update skills
        if (skills.required.length > 0 || skills.preferred.length > 0) {
          await updatePositionSkills(id, {
            required: skills.required.filter((s) => s.trim()),
            preferred: skills.preferred.filter((s) => s.trim()),
          });
        }

        // Handle status changes
        if (position.status === "ON_HOLD") {
          await updatePositionStatus(id, "ON_HOLD", statusReason);
        } else if (position.status === "CLOSED") {
          const selected =
            selectedCandidates && selectedCandidates.length > 0
              ? selectedCandidates.join(",")
              : (selectedCandidate && selectedCandidate.trim()) || null;
          await closePosition(id, {
            selectedCandidate: selected,
            reason: statusReason,
          });
        }

        navigate(`/positions/${position.positionId}`);
      } catch (err) {
        setError(err.message || "Failed to save changes");
        window.scrollTo(0, 0); // Scroll to top to show error
      } finally {
        setSaving(false);
      }
    } else {
      setShowConfirmDialog(true);
    }
  };

  const handleSkillChange = (type, index, value) => {
    const updatedSkills = { ...skills };
    updatedSkills[type][index] = value;
    setSkills(updatedSkills);
  };

  const addSkill = (type) => {
    const updatedSkills = { ...skills };
    updatedSkills[type].push("");
    setSkills(updatedSkills);
  };

  const removeSkill = (type, index) => {
    const updatedSkills = { ...skills };
    updatedSkills[type].splice(index, 1);
    setSkills(updatedSkills);
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Edit Position</h2>
        <Link
          to={`/positions/${id}`}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back to Position
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 max-w-2xl bg-white shadow-sm rounded-lg p-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Title
          </label>
          <input
            value={position.jobTitle}
            onChange={(e) =>
              setPosition({ ...position, jobTitle: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
            placeholder="Enter job title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Description
          </label>
          <textarea
            value={position.jobDescription}
            onChange={(e) =>
              setPosition({ ...position, jobDescription: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={6}
            required
            placeholder="Enter detailed job description"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Skills
          </label>
          {skills.required.map((skill, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                value={skill}
                onChange={(e) =>
                  handleSkillChange("required", index, e.target.value)
                }
                className="flex-1 border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter required skill"
                required
              />
              <button
                type="button"
                onClick={() => removeSkill("required", index)}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-md transition-colors duration-150"
              >
                <span className="sr-only">Remove</span>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addSkill("required")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Required Skill
          </button>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Skills
          </label>
          {skills.preferred.map((skill, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                value={skill}
                onChange={(e) =>
                  handleSkillChange("preferred", index, e.target.value)
                }
                className="flex-1 border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter preferred skill"
              />
              <button
                type="button"
                onClick={() => removeSkill("preferred", index)}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-md transition-colors duration-150"
              >
                <span className="sr-only">Remove</span>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addSkill("preferred")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Preferred Skill
          </button>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Position Status
          </label>
          <select
            value={position.status}
            onChange={(e) =>
              setPosition({ ...position, status: e.target.value })
            }
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="OPEN">Open</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {(position.status === "ON_HOLD" || position.status === "CLOSED") && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Reason for {position.status === "ON_HOLD" ? "Holding" : "Closing"}
            </label>
            <textarea
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              required
              placeholder={`Explain why this position is being ${
                position.status === "ON_HOLD" ? "put on hold" : "closed"
              }`}
            />
          </div>
        )}

        {position.status === "CLOSED" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Applied Candidate(s)
            </label>
            {applications.length === 0 ? (
              <div className="text-gray-500">
                No applications available to select.
              </div>
            ) : (
              <select
                multiple
                value={selectedCandidates}
                onChange={(e) => {
                  const opts = Array.from(e.target.selectedOptions).map(
                    (o) => o.value
                  );
                  setSelectedCandidates(opts);
                }}
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                size={Math.min(6, applications.length)}
              >
                {applications.map((app) => (
                  <option
                    key={app.applicationId}
                    value={String(app.applicationId)}
                  >
                    {app.candidate?.firstName} {app.candidate?.lastName} — #
                    {app.applicationId}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="pt-5 flex justify-between items-center">
          <Link
            to={`/positions/${id}`}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              saving ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Changes
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to save these changes? This will update the
              position details
              {position.status !== "OPEN" && " and change its status"}.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e)}
                className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPosition;
