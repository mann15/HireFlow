import { useState, useEffect } from "react";
import { scheduleBulkInterviews } from "../../services/interviewService";
import { getPositions } from "../../services/positionService";
import SearchableDropdown from "../SearchableDropdown";

const BulkInterviewScheduler = () => {
  const [form, setForm] = useState({
    eventName: "",
    eventType: "WALK_IN",
    positionId: "",
    eventDate: "",
    eventTime: "",
    mode: "IN_PERSON",
    location: "",
    candidateIds: "",
    panelistIds: "",
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

  useEffect(() => {
    fetchPositions();
  }, []);

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

  const resetStatus = () => setStatus({ type: "", message: "" });

  const parseIds = (value) =>
    value
      .split(/[,\n]/)
      .map((v) => parseInt(v.trim(), 10))
      .filter((v) => !Number.isNaN(v) && v > 0);

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
        candidateIds: parseIds(form.candidateIds),
        panelistIds: parseIds(form.panelistIds),
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
                subtitle: `${pos.department} • ${pos.status || 'OPEN'}`
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
              className="w-full border border-gray-300 rounded-md px-3 py-2"/>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Candidate IDs (comma or newline separated)
            </label>
            <textarea
              value={form.candidateIds}
              onChange={(e) =>
                setForm({ ...form, candidateIds: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={3}
              placeholder="101,102,103"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Panelist User IDs (comma or newline separated)
            </label>
            <textarea
              value={form.panelistIds}
              onChange={(e) =>
                setForm({ ...form, panelistIds: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={3}
              placeholder="201,202"
            />
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
