import { useState, useEffect } from "react";
import {
  scheduleInterview,
  getInterviewRounds,
} from "../../services/interviewService";
import { checkCandidateHistory } from "../../services/reviewService";
import { userService } from "../../services/apiService";
import {
  getErrorMessage,
  showError,
  showSuccess,
} from "../../utils/toastUtils";

const ScheduleInterview = ({
  applicationId,
  positionId,
  candidateName,
  onComplete,
  onClose,
  defaultMode = "ONLINE",
  defaultSendInvites = true,
  defaultOnlineAssessmentEnabled = false,
}) => {
  const [rounds, setRounds] = useState([]);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    applicationId: applicationId,
    roundId: "",
    interviewDate: "",
    interviewTime: "",
    mode: defaultMode || "ONLINE",
    interviewLink: "",
    location: "",
    panelistIds: [],
  });
  const [panelists, setPanelists] = useState([]);
  const [availableInterviewers, setAvailableInterviewers] = useState([]);
  const [useCustomRound, setUseCustomRound] = useState(false);
  const [customRound, setCustomRound] = useState({
    roundName: "Custom Round",
    roundType: "TECHNICAL",
    durationMinutes: 60,
  });
  const [sendInvites, setSendInvites] = useState(defaultSendInvites);
  const [notifyTargets, setNotifyTargets] = useState({
    candidate: true,
    recruiters: true,
    panelists: true,
  });
  const [onlineAssessment, setOnlineAssessment] = useState({
    enabled: defaultOnlineAssessmentEnabled,
    name: "Online Test",
    date: "",
    time: "",
    platform: "Online Examination Module",
    notes: "",
  });
  const [onlineAssessmentStatus, setOnlineAssessmentStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const modes = ["IN_PERSON", "PHONE", "ONLINE", "HYBRID"];
  const roundTypes = ["TECHNICAL", "HR", "PANEL", "MANAGERIAL", "ONLINE_TEST"];

  useEffect(() => {
    if (positionId) {
      fetchRounds();
    }
    if (applicationId) {
      checkForPreviousHistory();
    }
    fetchInterviewers();
  }, [positionId, applicationId]);

  // Keep applicationId in form data in sync with prop
  useEffect(() => {
    if (applicationId) {
      setFormData((prev) => ({ ...prev, applicationId }));
    }
  }, [applicationId]);

  // Sync preset mode/send/test when parent changes them
  useEffect(() => {
    setFormData((prev) => ({ ...prev, mode: defaultMode || "ONLINE" }));
  }, [defaultMode]);

  useEffect(() => {
    setSendInvites(defaultSendInvites);
  }, [defaultSendInvites]);

  useEffect(() => {
    setOnlineAssessment((prev) => ({
      ...prev,
      enabled: defaultOnlineAssessmentEnabled,
    }));
  }, [defaultOnlineAssessmentEnabled]);

  const checkForPreviousHistory = async () => {
    try {
      const history = await checkCandidateHistory(applicationId);

      if (history.hasPreviousInterview || history.hasPreviousScreening) {
        setNotification({
          type: "warning",
          message:
            history.message ||
            "This candidate has been screened/interviewed previously",
          details: history.details || [],
        });
      }
    } catch (err) {
      console.error("Error checking candidate history:", err);
    }
  };

  const fetchRounds = async () => {
    try {
      const data = await getInterviewRounds(positionId);
      setRounds(data);
      if (!data || data.length === 0) {
        setUseCustomRound(true);
      }
    } catch (err) {
      console.error("Failed to fetch rounds:", err);
      setUseCustomRound(true);
    }
  };

  const fetchInterviewers = async () => {
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
      setAvailableInterviewers(eligible);
    } catch (err) {
      console.error("Failed to load interviewers:", err);
      setAvailableInterviewers([]);
    }
  };

  const togglePanelist = (userId) => {
    if (panelists.includes(userId)) {
      setPanelists(panelists.filter((id) => id !== userId));
    } else {
      setPanelists([...panelists, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOnlineAssessmentStatus("");

    try {
      if (!formData.applicationId) {
        throw new Error("applicationId is required");
      }

      const panelistIds = panelists
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id) && id > 0);

      const dateTime = `${formData.interviewDate}T${formData.interviewTime}:00`;

      const onlineAssessmentPayload = onlineAssessment.enabled
        ? {
            name: onlineAssessment.name || "Online Test",
            scheduledAt:
              onlineAssessment.date && onlineAssessment.time
                ? `${onlineAssessment.date}T${onlineAssessment.time}:00`
                : null,
            platform: onlineAssessment.platform,
            notes: onlineAssessment.notes,
          }
        : undefined;

      const payload = {
        applicationId: Number(formData.applicationId),
        roundId: useCustomRound ? null : parseInt(formData.roundId),
        customRound: useCustomRound
          ? {
              ...customRound,
              durationMinutes: Number(customRound.durationMinutes) || 60,
            }
          : undefined,
        interviewDate: dateTime,
        mode: formData.mode,
        interviewLink:
          formData.mode === "ONLINE" ? formData.interviewLink : null,
        location: formData.mode === "IN_PERSON" ? formData.location : null,
        panelistIds: panelistIds,
        isPanel: panelistIds.length > 1,
        sendInvites,
        notify: notifyTargets,
        onlineAssessment: onlineAssessmentPayload,
      };

      await scheduleInterview(payload);
      showSuccess("Interview scheduled successfully!");
      if (onlineAssessment.enabled) {
        setOnlineAssessmentStatus(
          onlineAssessmentPayload?.scheduledAt
            ? `Online examination scheduled for ${onlineAssessmentPayload.scheduledAt}`
            : "Online examination marked as scheduled."
        );
      }
      if (onComplete) onComplete();
    } catch (err) {
      const message = getErrorMessage(err, "Failed to schedule interview");
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 relative">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          ✕
        </button>
      )}
      <h2 className="text-2xl font-bold mb-4">Schedule Interview</h2>
      {candidateName && (
        <p className="text-gray-600 mb-6">Candidate: {candidateName}</p>
      )}

      {/* History Notification */}
      {notification && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                {notification.message}
              </h3>
              {notification.details && notification.details.length > 0 && (
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    {notification.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="radio"
                name="roundMode"
                value="defined"
                checked={!useCustomRound}
                onChange={() => setUseCustomRound(false)}
              />
              Use defined rounds
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="radio"
                name="roundMode"
                value="custom"
                checked={useCustomRound}
                onChange={() => setUseCustomRound(true)}
              />
              Custom round for this candidate
            </label>
          </div>

          {!useCustomRound && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Round *
              </label>
              {rounds.length === 0 ? (
                <div className="text-sm text-gray-600 bg-gray-50 border border-dashed border-gray-300 rounded-md px-3 py-2">
                  No defined rounds for this position. Switching to custom
                  round.
                </div>
              ) : (
                <select
                  value={formData.roundId}
                  onChange={(e) =>
                    setFormData({ ...formData, roundId: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select Round</option>
                  {rounds.map((round) => (
                    <option key={round.id} value={round.id}>
                      {round.roundName} - {round.roundType}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {useCustomRound && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-dashed border-gray-200 rounded-lg p-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Round Name *
                </label>
                <input
                  type="text"
                  value={customRound.roundName}
                  onChange={(e) =>
                    setCustomRound({
                      ...customRound,
                      roundName: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., Senior Panel"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Round Type *
                </label>
                <select
                  value={customRound.roundType}
                  onChange={(e) =>
                    setCustomRound({
                      ...customRound,
                      roundType: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {roundTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={customRound.durationMinutes}
                  onChange={(e) =>
                    setCustomRound({
                      ...customRound,
                      durationMinutes: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Date *
              </label>
              <input
                type="date"
                value={formData.interviewDate}
                onChange={(e) =>
                  setFormData({ ...formData, interviewDate: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Time *
              </label>
              <input
                type="time"
                value={formData.interviewTime}
                onChange={(e) =>
                  setFormData({ ...formData, interviewTime: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interview Mode *
            </label>
            <select
              value={formData.mode}
              onChange={(e) =>
                setFormData({ ...formData, mode: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              {modes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {formData.mode === "ONLINE" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Link *
              </label>
              <input
                type="url"
                value={formData.interviewLink}
                onChange={(e) =>
                  setFormData({ ...formData, interviewLink: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://meet.google.com/..."
                required={formData.mode === "ONLINE"}
              />
            </div>
          )}

          {formData.mode === "IN_PERSON" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Meeting Room, Floor, Building..."
                required={formData.mode === "IN_PERSON"}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interviewers/Panelists
            </label>
            {availableInterviewers.length === 0 ? (
              <p className="text-sm text-gray-600">
                No interviewers available to select.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {panelists.map((id) => {
                    const user = availableInterviewers.find(
                      (u) => u.userId === id
                    );
                    return (
                      <span
                        key={id}
                        className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs"
                      >
                        {user
                          ? `${user.firstName} ${user.lastName}`
                          : `User ${id}`}
                        <button
                          type="button"
                          onClick={() => togglePanelist(id)}
                          className="text-indigo-500 hover:text-indigo-700"
                          aria-label="Remove interviewer"
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
                <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {availableInterviewers.map((user) => (
                    <label
                      key={user.userId}
                      className="flex items-center gap-2 py-1 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={panelists.includes(user.userId)}
                        onChange={() => togglePanelist(user.userId)}
                      />
                      <span className="font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({user.role?.roleName || ""})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {panelists.length > 1 && (
              <p className="text-xs text-gray-500 mt-2">
                Panel interview detected — multiple interviewers will be invited
                and can score simultaneously.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 rounded-lg p-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Meeting invites
            </p>
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={sendInvites}
                onChange={(e) => setSendInvites(e.target.checked)}
              />
              Send calendar invites when scheduling
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notifyTargets.candidate}
                  onChange={(e) =>
                    setNotifyTargets({
                      ...notifyTargets,
                      candidate: e.target.checked,
                    })
                  }
                  disabled={!sendInvites}
                />
                Notify candidate
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notifyTargets.recruiters}
                  onChange={(e) =>
                    setNotifyTargets({
                      ...notifyTargets,
                      recruiters: e.target.checked,
                    })
                  }
                  disabled={!sendInvites}
                />
                Notify recruiters
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notifyTargets.panelists}
                  onChange={(e) =>
                    setNotifyTargets({
                      ...notifyTargets,
                      panelists: e.target.checked,
                    })
                  }
                  disabled={!sendInvites}
                />
                Notify interviewers
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-semibold text-gray-700">
                Pre-interview online test
              </p>
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={onlineAssessment.enabled}
                  onChange={(e) =>
                    setOnlineAssessment({
                      ...onlineAssessment,
                      enabled: e.target.checked,
                    })
                  }
                />
                Schedule an online examination
              </label>
            </div>

            {onlineAssessment.enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="block text-gray-700 mb-1">Test date</label>
                  <input
                    type="date"
                    value={onlineAssessment.date}
                    onChange={(e) =>
                      setOnlineAssessment({
                        ...onlineAssessment,
                        date: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Test time</label>
                  <input
                    type="time"
                    value={onlineAssessment.time}
                    onChange={(e) =>
                      setOnlineAssessment({
                        ...onlineAssessment,
                        time: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Platform</label>
                  <input
                    type="text"
                    value={onlineAssessment.platform}
                    onChange={(e) =>
                      setOnlineAssessment({
                        ...onlineAssessment,
                        platform: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Online Examination Module"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Notes</label>
                  <input
                    type="text"
                    value={onlineAssessment.notes}
                    onChange={(e) =>
                      setOnlineAssessment({
                        ...onlineAssessment,
                        notes: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Instructions or scope"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {onlineAssessmentStatus && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-3 rounded mb-2 text-sm">
            {onlineAssessmentStatus}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onComplete}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Scheduling..." : "Schedule Interview"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleInterview;
