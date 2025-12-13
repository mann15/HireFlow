import React, { useState } from "react";
import DefineInterviewRounds from "../../components/interviews/DefineInterviewRounds";
import ScheduleInterview from "../../components/interviews/ScheduleInterview";
import BulkInterviewScheduler from "../../components/interviews/BulkInterviewScheduler";

const InterviewManagement = () => {
  const [positionId, setPositionId] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [candidateName, setCandidateName] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interview Scheduling & Process
          </h1>
          <p className="text-gray-600">
            Define default rounds (or candidate-specific overrides), schedule
            panel interviews, record pre-interview online tests, and plan bulk
            hiring events.
          </p>
        </header>

        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Default & Candidate-Specific Rounds
              </h2>
              <p className="text-sm text-gray-600">
                Set the number and types of rounds for a position, or override
                for specific candidates.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Position ID</label>
              <input
                type="number"
                min="1"
                value={positionId}
                onChange={(e) => setPositionId(e.target.value)}
                className="w-36 border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g., 12"
              />
            </div>
          </div>

          {positionId ? (
            <DefineInterviewRounds positionId={positionId} />
          ) : (
            <p className="text-sm text-gray-500">
              Enter a position ID to configure rounds.
            </p>
          )}
        </section>

        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Schedule a Single Interview
              </h2>
              <p className="text-sm text-gray-600">
                Supports panel interviews and invites. Optionally mark an online
                examination as scheduled before the interview.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Application ID</label>
                <input
                  type="number"
                  min="1"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  className="w-32 border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., 45"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Position ID</label>
                <input
                  type="number"
                  min="1"
                  value={positionId}
                  onChange={(e) => setPositionId(e.target.value)}
                  className="w-32 border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., 12"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Candidate Name</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-48 border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Optional display name"
                />
              </div>
            </div>
          </div>

          {applicationId && positionId ? (
            <ScheduleInterview
              applicationId={applicationId}
              positionId={positionId}
              candidateName={candidateName}
            />
          ) : (
            <p className="text-sm text-gray-500">
              Provide both application ID and position ID to schedule.
            </p>
          )}
        </section>

        <section>
          <BulkInterviewScheduler />
        </section>
      </div>
    </div>
  );
};

export default InterviewManagement;
