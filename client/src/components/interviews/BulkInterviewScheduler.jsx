import { useState, useEffect } from "react";
import { scheduleBulkInterviews } from "../../services/interviewService";
import { getPositions } from "../../services/positionService";
import { getApplicationsByPosition } from "../../services/applicationService";
import { userService } from "../../services/apiService";
import SearchableDropdown from "../SearchableDropdown";

const BulkInterviewScheduler = ({ selectedPositionId = "" }) => {
  const [form, setForm] = useState({
    eventName: "",
    eventType: "WALK_IN",
    positionId: "",
    eventDate: "",
    eventTime: "",
    mode: "IN_PERSON",
    location: "",
    candidateIds: [],
    panelistIds: [],
    notes: "",
  });
  const [onlineTest, setOnlineTest] = useState({
    enabled: false,
    date: "",
    time: "",
    platform: "Online Examination Module",
  });
  const [sendInvites, setSendInvites] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [panelists, setPanelists] = useState([]);
  const [loadingPanelists, setLoadingPanelists] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [panelistSearch, setPanelistSearch] = useState("");

  useEffect(() => {
    fetchPositions();
  }, []);

  // Respect a pre-selected position from parent
  useEffect(() => {
    if (selectedPositionId) {
      setForm((prev) => ({ ...prev, positionId: selectedPositionId }));
    }
  }, [selectedPositionId]);

  const fetchPositions = async () => {
    try {
      setLoadingPositions(true);
      const data = await getPositions();
      setPositions(data || []);
    } catch (err) {
      console.error("Failed to load positions", err);
    } finally {
      setLoadingPositions(false);
    }
  };

  const fetchCandidates = async (positionId) => {
    if (!positionId) {
      setCandidates([]);
      return;
    }
    setLoadingCandidates(true);
    try {
      const apps = await getApplicationsByPosition(positionId);
      const mapped = (apps || [])
        .filter((app) => app.candidate)
        .map((app) => {
          const c = app.candidate;
          const u = c.user || {};
          const name = `${u.firstName || c.firstName || ""} ${
            u.lastName || c.lastName || ""
          }`.trim();
          const email = u.email || c.email || "";
          return {
            id: c.candidateId,
            label: name || email || `Candidate ${c.candidateId}`,
            subtitle: email || app.status || "",
          };
        });
      setCandidates(mapped);
    } catch (err) {
      console.error("Failed to load candidates", err);
      setCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const fetchPanelists = async () => {
    setLoadingPanelists(true);
    try {
      const users = await userService.getUsers();
      const eligible = (users || []).filter((u) =>
        [
          "INTERVIEWER",
          "REVIEWER",
          "HR",
          "RECRUITER",
          "ADMIN",
          "SUPER_ADMIN",
        ].includes(u.role?.roleName)
      );
      setPanelists(eligible);
    } catch (err) {
      console.error("Failed to load panelists", err);
      setPanelists([]);
    } finally {
      setLoadingPanelists(false);
    }
  };

  // Load candidates and panelists when a position is chosen
  useEffect(() => {
    if (form.positionId) {
      fetchCandidates(form.positionId);
    } else {
      setCandidates([]);
      setForm((prev) => ({ ...prev, candidateIds: [] }));
    }
    fetchPanelists();
  }, [form.positionId]);

  const resetStatus = () => setStatus({ type: "", message: "" });

  const toggleCandidate = (id) => {
    setForm((prev) => {
      const exists = prev.candidateIds.includes(id);
      const nextIds = exists
        ? prev.candidateIds.filter((cId) => cId !== id)
        : [...prev.candidateIds, id];
      return { ...prev, candidateIds: nextIds };
    });
  };

  const togglePanelist = (id) => {
    setForm((prev) => {
      const exists = prev.panelistIds.includes(id);
      const nextIds = exists
        ? prev.panelistIds.filter((pId) => pId !== id)
        : [...prev.panelistIds, id];
      return { ...prev, panelistIds: nextIds };
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    resetStatus();
    setLoading(true);

    try {
      const schedule = `${form.eventDate}T${form.eventTime || "00:00"}:00`;
      const payload = {
        eventName: form.eventName || `${form.eventType} hiring event`,
        eventType: form.eventType,
        positionId: form.positionId ? parseInt(form.positionId, 10) : null,
        schedule,
        mode: form.mode,
        location: form.mode === "IN_PERSON" ? form.location : null,
        candidateIds: form.candidateIds,
        panelistIds: form.panelistIds,
        notes: form.notes,
        trackAsEvent: true,
        sendInvites,
        notify: {
          candidates: true,
          recruiters: true,
          panelists: true,
        },
        onlineAssessment: onlineTest.enabled
          ? {
              name: "Online Test",
              scheduledAt:
                onlineTest.date && onlineTest.time
                  ? `${onlineTest.date}T${onlineTest.time}:00`
                  : null,
              platform: onlineTest.platform,
            }
          : undefined,
      };

      await scheduleBulkInterviews(payload);
      setStatus({
        type: "success",
        message:
          "Bulk interview event scheduled and tracked separately. Meeting invites will be sent to participants.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.error || "Failed to schedule bulk event",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">Bulk Interview Event</h3>
          <p className="text-sm text-gray-600">
            Plan walk-ins or campus drives and track them as separate events.
          </p>
        </div>
      </div>

      {status.message && (
        <div
          className={`mb-4 px-4 py-3 rounded border text-sm ${
            status.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name
            </label>
            <input
              type="text"
              value={form.eventName}
              onChange={(e) => setForm({ ...form, eventName: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Walk-in @ Bangalore"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              value={form.eventType}
              onChange={(e) => setForm({ ...form, eventType: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="WALK_IN">Walk-in</option>
              <option value="CAMPUS">Campus</option>
              <option value="VIRTUAL_FAIR">Virtual Hiring Fair</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <SearchableDropdown
              label="Position (optional)"
              value={form.positionId}
              onChange={(value) => setForm({ ...form, positionId: value })}
              options={positions.map((pos) => ({
                value: pos.positionId || pos.id,
                label: `${pos.jobTitle} (#${pos.positionId || pos.id})`,
                subtitle: `${pos.department} • ${pos.status || "OPEN"}`,
              }))}
              placeholder="Select a position"
              loading={loadingPositions}
              noOptionsText="No positions found"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Date
          </label>
          <input
            type="date"
            value={form.eventDate}
            onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <input
            type="time"
            value={form.eventTime}
            onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mode
            </label>
            <select
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="IN_PERSON">In Person</option>
              <option value="ONLINE">Online</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location (for in-person)
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Auditorium / Campus Hall"
              disabled={form.mode === "ONLINE"}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Candidates for this position
            </label>
            <input
              type="text"
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              placeholder="Search candidates by name/email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto p-2">
              {loadingCandidates ? (
                <p className="text-sm text-gray-500">Loading candidates...</p>
              ) : candidates.length === 0 ? (
                <p className="text-sm text-gray-500">
                  {form.positionId
                    ? "No candidates for this position"
                    : "Select a position to load candidates"}
                </p>
              ) : (
                (() => {
                  const filtered = candidates.filter((c) =>
                    `${c.label} ${c.subtitle}`
                      .toLowerCase()
                      .includes(candidateSearch.toLowerCase())
                  );
                  const allFilteredIds = filtered.map((c) => c.id);
                  const allSelected =
                    filtered.length > 0 &&
                    allFilteredIds.every((id) =>
                      form.candidateIds.includes(id)
                    );

                  return (
                    <div className="space-y-1">
                      <label className="flex items-center gap-2 py-1 text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm((prev) => ({
                                ...prev,
                                candidateIds: Array.from(
                                  new Set([
                                    ...prev.candidateIds,
                                    ...allFilteredIds,
                                  ])
                                ),
                              }));
                            } else {
                              setForm((prev) => ({
                                ...prev,
                                candidateIds: prev.candidateIds.filter(
                                  (id) => !allFilteredIds.includes(id)
                                ),
                              }));
                            }
                          }}
                        />
                        Select all shown
                      </label>

                      {filtered.map((c) => (
                        <label
                          key={c.id}
                          className="flex items-center gap-2 py-1 text-sm text-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={form.candidateIds.includes(c.id)}
                            onChange={() => toggleCandidate(c.id)}
                          />
                          <span className="font-medium">{c.label}</span>
                          {c.subtitle && (
                            <span className="text-xs text-gray-500">
                              {c.subtitle}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Panelists
            </label>
            <input
              type="text"
              value={panelistSearch}
              onChange={(e) => setPanelistSearch(e.target.value)}
              placeholder="Search panelists by name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto p-2">
              {loadingPanelists ? (
                <p className="text-sm text-gray-500">Loading panelists...</p>
              ) : panelists.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No interviewers available
                </p>
              ) : (
                panelists
                  .filter((p) =>
                    `${p.firstName} ${p.lastName} ${p.role?.roleName}`
                      .toLowerCase()
                      .includes(panelistSearch.toLowerCase())
                  )
                  .map((p) => (
                    <label
                      key={p.userId}
                      className="flex items-center gap-2 py-1 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={form.panelistIds.includes(p.userId)}
                        onChange={() => togglePanelist(p.userId)}
                      />
                      <span className="font-medium">
                        {p.firstName} {p.lastName}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({p.role?.roleName || ""})
                      </span>
                    </label>
                  ))
              )}
            </div>
            {form.panelistIds.length > 1 && (
              <p className="text-xs text-gray-500">
                Panel interview: multiple interviewers will be invited.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={sendInvites}
                onChange={(e) => setSendInvites(e.target.checked)}
              />
              Send invites to candidates, recruiters, and panelists
            </label>
          </div>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={onlineTest.enabled}
                onChange={(e) =>
                  setOnlineTest({ ...onlineTest, enabled: e.target.checked })
                }
              />
              Mark pre-interview online test as scheduled
            </label>
            {onlineTest.enabled && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={onlineTest.date}
                  onChange={(e) =>
                    setOnlineTest({ ...onlineTest, date: e.target.value })
                  }
                  className="border border-gray-300 rounded px-3 py-2"
                />
                <input
                  type="time"
                  value={onlineTest.time}
                  onChange={(e) =>
                    setOnlineTest({ ...onlineTest, time: e.target.value })
                  }
                  className="border border-gray-300 rounded px-3 py-2"
                />
                <input
                  type="text"
                  value={onlineTest.platform}
                  onChange={(e) =>
                    setOnlineTest({ ...onlineTest, platform: e.target.value })
                  }
                  className="border border-gray-300 rounded px-3 py-2 col-span-2"
                  placeholder="Online Examination Module"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            rows={3}
            placeholder="Any logistics, track as a separate hiring event, etc."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Scheduling..." : "Schedule Bulk Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BulkInterviewScheduler;
