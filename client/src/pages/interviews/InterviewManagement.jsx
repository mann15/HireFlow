import React, { useState, useEffect } from "react";
import DefineInterviewRounds from "../../components/interviews/DefineInterviewRounds";
import ScheduleInterview from "../../components/interviews/ScheduleInterview";
import BulkInterviewScheduler from "../../components/interviews/BulkInterviewScheduler";
import SearchableDropdown from "../../components/SearchableDropdown";
import { getPositions } from "../../services/positionService";
import { getApplicationsByPosition } from "../../services/applicationService";

const InterviewManagement = () => {
  const [positionId, setPositionId] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [positions, setPositions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [activeTab, setActiveTab] = useState("single");
  const [presetMode, setPresetMode] = useState("ONLINE");
  const [presetSendInvites, setPresetSendInvites] = useState(true);
  const [presetOnlineTest, setPresetOnlineTest] = useState(false);

  // Fetch positions on mount
  useEffect(() => {
    const fetchPositions = async () => {
      setLoadingPositions(true);
      try {
        const data = await getPositions();
        setPositions(data);
      } catch (error) {
        console.error("Failed to fetch positions:", error);
      } finally {
        setLoadingPositions(false);
      }
    };
    fetchPositions();
  }, []);
  // Load applications when a position is chosen so we can drop IDs
  useEffect(() => {
    const fetchApplications = async () => {
      if (!positionId) {
        setApplications([]);
        setApplicationId("");
        setCandidateName("");
        return;
      }
      setLoadingApplications(true);
      try {
        const data = await getApplicationsByPosition(positionId);
        setApplications(data || []);
      } catch (err) {
        console.error("Failed to fetch applications: ", err);
        setApplications([]);
      } finally {
        setLoadingApplications(false);
      }
    };
    fetchApplications();
  }, [positionId]);

  console.log(positions);
  // Transform positions into dropdown options with details
  const positionOptions = positions.map((pos) => ({
    value: pos.positionId,
    label: `${pos.jobTitle} - ${pos.department || "N/A"} (${
      pos.employmentType || "N/A"
    })`,
  }));

  const applicationOptions = applications.map((app) => {
    const candidate = app.candidate || {};
    const user = candidate.user || {};
    const name = `${user.firstName || candidate.firstName || ""} ${
      user.lastName || candidate.lastName || ""
    }`.trim();
    const email = user.email || candidate.email || "";
    return {
      value: app.applicationId,
      label: name || email || `Application #${app.applicationId}`,
      subtitle: email
        ? `${email}${app.status ? ` • ${app.status}` : ""}`
        : app.status || "",
    };
  });

  const handleApplicationSelect = (value) => {
    setApplicationId(value);
    const selected = applications.find((app) => app.applicationId === value);
    if (selected?.candidate) {
      const c = selected.candidate;
      const u = c.user || {};
      const name = `${u.firstName || c.firstName || ""} ${
        u.lastName || c.lastName || ""
      }`.trim();
      setCandidateName(name);
    } else {
      setCandidateName("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Interview Scheduling & Process
          </h1>
          <p className="text-gray-600">
            Switch between default rounds, single scheduling, and bulk events
            without typing raw IDs.
          </p>
        </header>

        <div className="bg-white rounded-lg shadow p-3 flex flex-wrap gap-2">
          {[
            { key: "rounds", label: "Rounds & Templates" },
            { key: "single", label: "Single Interview" },
            { key: "bulk", label: "Bulk Event" },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`px-4 py-2 rounded-md text-sm font-medium transition border ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="w-full md:w-96">
            <SearchableDropdown
              options={positionOptions}
              value={positionId}
              onChange={setPositionId}
              label="Position"
              placeholder="Select a position..."
              loading={loadingPositions}
              noOptionsText="No positions available"
            />
          </div>

          {activeTab === "rounds" &&
            (positionId ? (
              <DefineInterviewRounds positionId={positionId} />
            ) : (
              <p className="text-sm text-gray-500">
                Choose a position to view or override its round plan.
              </p>
            ))}

          {activeTab === "single" && (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-semibold text-gray-800 mb-3">
                  How do you want to run this interview?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {["ONLINE", "IN_PERSON", "HYBRID"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPresetMode(mode)}
                      className={`border rounded-md px-3 py-2 text-sm text-left transition ${
                        presetMode === mode
                          ? "border-blue-600 bg-blue-50 text-blue-800"
                          : "border-gray-200 bg-white text-gray-800 hover:border-blue-200"
                      }`}
                    >
                      <div className="font-semibold">
                        {mode.replace("_", " ")}
                      </div>
                      <div className="text-xs text-gray-600">
                        {mode === "ONLINE"
                          ? "Video link required"
                          : mode === "IN_PERSON"
                          ? "Add on-site location"
                          : "Combine link + location"}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={presetSendInvites}
                      onChange={(e) => setPresetSendInvites(e.target.checked)}
                    />
                    Send calendar invites
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={presetOnlineTest}
                      onChange={(e) => setPresetOnlineTest(e.target.checked)}
                    />
                    Pre-interview online test
                  </label>
                  <div className="text-xs text-gray-500">
                    These choices seed the scheduler below; you can still adjust
                    inside the form.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SearchableDropdown
                  options={applicationOptions}
                  value={applicationId}
                  onChange={handleApplicationSelect}
                  label="Application"
                  placeholder={
                    positionId
                      ? "Select application for this position"
                      : "Select a position first"
                  }
                  loading={loadingApplications}
                  noOptionsText={
                    positionId
                      ? "No applications for this position"
                      : "Select a position to load applications"
                  }
                  className="w-full"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Candidate (auto)
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Select application to populate"
                    disabled={!applicationId}
                  />
                </div>
              </div>

              {applicationId && positionId ? (
                <ScheduleInterview
                  applicationId={applicationId}
                  positionId={positionId}
                  candidateName={candidateName}
                  defaultMode={presetMode}
                  defaultSendInvites={presetSendInvites}
                  defaultOnlineAssessmentEnabled={presetOnlineTest}
                />
              ) : (
                <p className="text-sm text-gray-500">
                  Pick a position and application to schedule.
                </p>
              )}
            </div>
          )}

          {activeTab === "bulk" && (
            <BulkInterviewScheduler selectedPositionId={positionId} />
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewManagement;
