import React, { useState } from "react";
import {
  defineInterviewRounds,
  scheduleInterview,
  simulateOnlineInterview,
  scheduleBulkInterviews,
} from "../../services/interviewService";

const InterviewManagement = () => {
  const [roundsData, setRoundsData] = useState("");
  const [scheduleData, setScheduleData] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [bulkData, setBulkData] = useState("");

  const handleDefineRounds = async () => {
    try {
      await defineInterviewRounds(roundsData);
      alert("Interview rounds defined successfully");
    } catch (error) {
      console.error("Failed to define interview rounds", error);
    }
  };

  const handleScheduleInterview = async () => {
    try {
      await scheduleInterview(scheduleData);
      alert("Interview scheduled successfully");
    } catch (error) {
      console.error("Failed to schedule interview", error);
    }
  };

  const handleSimulateOnlineInterview = async () => {
    try {
      const result = await simulateOnlineInterview(candidateId);
      alert(`Candidate ${result.candidateId} scored ${result.marks} marks`);
    } catch (error) {
      console.error("Failed to simulate online interview", error);
    }
  };

  const handleScheduleBulkInterviews = async () => {
    try {
      await scheduleBulkInterviews(bulkData);
      alert("Bulk interviews scheduled successfully");
    } catch (error) {
      console.error("Failed to schedule bulk interviews", error);
    }
  };

  return (
    <div className="interview-management">
      <h1>Interview Management</h1>

      <div>
        <h2>Define Interview Rounds</h2>
        <textarea
          placeholder="Rounds Data"
          value={roundsData}
          onChange={(e) => setRoundsData(e.target.value)}
        ></textarea>
        <button onClick={handleDefineRounds}>Define Rounds</button>
      </div>

      <div>
        <h2>Schedule Interview</h2>
        <textarea
          placeholder="Schedule Data"
          value={scheduleData}
          onChange={(e) => setScheduleData(e.target.value)}
        ></textarea>
        <button onClick={handleScheduleInterview}>Schedule</button>
      </div>

      <div>
        <h2>Simulate Online Interview</h2>
        <input
          type="text"
          placeholder="Candidate ID"
          value={candidateId}
          onChange={(e) => setCandidateId(e.target.value)}
        />
        <button onClick={handleSimulateOnlineInterview}>Simulate</button>
      </div>

      <div>
        <h2>Schedule Bulk Interviews</h2>
        <textarea
          placeholder="Bulk Data"
          value={bulkData}
          onChange={(e) => setBulkData(e.target.value)}
        ></textarea>
        <button onClick={handleScheduleBulkInterviews}>Schedule Bulk</button>
      </div>
    </div>
  );
};

export default InterviewManagement;
