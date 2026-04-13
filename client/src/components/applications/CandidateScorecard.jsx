import { useEffect, useState } from "react";
import { getScreeningFeedback } from "../../services/reviewService";
import { feedbackService, interviewService } from "../../services/apiService";

const fmt = (dt) => {
  if (!dt) return "—";
  const d = new Date(dt);
  return Number.isNaN(d.getTime()) ? String(dt) : d.toLocaleString();
};

const ScoreBar = ({ score, max = 10 }) => {
  const pct = Math.min(100, (Number(score) / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div
          className="bg-indigo-500 h-2 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700 w-10 text-right">
        {Number(score).toFixed(1)}/{max}
      </span>
    </div>
  );
};

const CandidateScorecard = ({ applicationId }) => {
  const [screeningFeedbacks, setScreeningFeedbacks] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!applicationId) return;
    loadAll();
  }, [applicationId]);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const sfList = await getScreeningFeedback(applicationId).catch(() => []);
      setScreeningFeedbacks(Array.isArray(sfList) ? sfList : []);

      const iList = await interviewService
        .getInterviewsByApplication(applicationId)
        .catch(() => []);
      const interviewArray = Array.isArray(iList)
        ? iList
        : Array.isArray(iList?.data)
          ? iList.data
          : [];

      const withFeedbacks = await Promise.all(
        interviewArray.map(async (iv) => {
          const ivId = iv.interviewId || iv.id;
          const fbList = await feedbackService
            .getInterviewFeedback(ivId)
            .catch(() => []);
          return { interview: iv, feedbacks: Array.isArray(fbList) ? fbList : [] };
        }),
      );
      setInterviews(withFeedbacks);
    } catch (err) {
      console.error("Scorecard error:", err);
      setError("Failed to load scorecard data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  const validSFScores = screeningFeedbacks.filter(
    (f) => f.score != null && !Number.isNaN(Number(f.score)),
  );
  const avgScreeningScore =
    validSFScores.length > 0
      ? (
          validSFScores.reduce((s, f) => s + Number(f.score), 0) /
          validSFScores.length
        ).toFixed(1)
      : null;

  const allInterviewFeedbacks = interviews.flatMap((iv) => iv.feedbacks);
  const validIFScores = allInterviewFeedbacks.filter(
    (f) => f.overall_rating != null && !Number.isNaN(Number(f.overall_rating)),
  );
  const avgInterviewScore =
    validIFScores.length > 0
      ? (
          validIFScores.reduce((s, f) => s + Number(f.overall_rating), 0) /
          validIFScores.length
        ).toFixed(1)
      : null;

  const hasAny =
    screeningFeedbacks.length > 0 || allInterviewFeedbacks.length > 0;

  return (
    <div className="space-y-6">

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Score Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">CV / Screening Score (avg)</p>
            <p className="font-medium text-gray-900 mt-1">
              {avgScreeningScore != null ? `${avgScreeningScore} / 10` : "No data"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {validSFScores.length} reviewer{validSFScores.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Interview Score (avg)</p>
            <p className="font-medium text-gray-900 mt-1">
              {avgInterviewScore != null ? `${avgInterviewScore} / 10` : "No data"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {validIFScores.length} panelist{validIFScores.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Interview Rounds</p>
            <p className="font-medium text-gray-900 mt-1">{interviews.length}</p>
          </div>
        </div>
      </div>

      {!hasAny && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">
            No feedback or scores have been submitted yet for this application.
          </p>
        </div>
      )}

      {/* Screening Feedback */}
      {screeningFeedbacks.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">CV Screening Feedback</h3>
          <div className="space-y-3">
            {screeningFeedbacks.map((fb, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">{fb.reviewerName || "Reviewer"}</p>
                  <span className="text-xs text-gray-500">{fmt(fb.reviewedAt)}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Recommendation</p>
                    <p className="font-medium text-gray-900">{fb.recommendation || "—"}</p>
                  </div>
                  {fb.score != null && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Score</p>
                      <ScoreBar score={fb.score} />
                    </div>
                  )}
                </div>
                {fb.comments && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Comments</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {fb.comments}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interview Rounds */}
      {interviews.map(({ interview, feedbacks }, roundIdx) => {
        const ivId = interview.interviewId || interview.id;
        const roundName =
          interview.round?.roundName ||
          interview.roundName ||
          `Interview Round ${roundIdx + 1}`;
        const roundType = interview.round?.roundType || interview.roundType || "";

        return (
          <div key={ivId} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {roundName}
                  {roundType && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({roundType})
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Scheduled: {fmt(interview.interviewDate || interview.scheduledAt)}
                </p>
              </div>
              <span className="text-sm text-gray-600">{interview.status}</span>
            </div>

            {feedbacks.length === 0 ? (
              <p className="text-sm text-gray-500">
                No feedback submitted for this round yet.
              </p>
            ) : (
              <div className="space-y-3">
                {feedbacks.map((fb, fbIdx) => {
                  const panelName =
                    fb.panelistName ||
                    (fb.panelist
                      ? `${fb.panelist.firstName || ""} ${fb.panelist.lastName || ""}`.trim()
                      : "Panelist");

                  return (
                    <div key={fbIdx} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <p className="font-medium">{panelName}</p>
                        <span className="text-xs text-gray-500">
                          {fmt(fb.submittedAt || fb.createdAt)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        {fb.overall_rating != null && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Overall Rating</p>
                            <ScoreBar score={fb.overall_rating} />
                          </div>
                        )}
                        {fb.technical_knowledge != null && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Technical Knowledge</p>
                            <ScoreBar score={fb.technical_knowledge} />
                          </div>
                        )}
                        {fb.communication_skills != null && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Communication Skills</p>
                            <ScoreBar score={fb.communication_skills} />
                          </div>
                        )}
                        {fb.cultural_fit_rating != null && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Cultural Fit</p>
                            <ScoreBar score={fb.cultural_fit_rating} />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Recommendation</p>
                          <p className="font-medium text-gray-900">{fb.recommendation || "—"}</p>
                        </div>
                        {fb.stage && (
                          <div>
                            <p className="text-sm text-gray-600">Stage</p>
                            <p className="font-medium text-gray-900">{fb.stage}</p>
                          </div>
                        )}
                      </div>

                      {fb.strengths && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600 mb-1">Strengths</p>
                          <p className="text-sm text-gray-700">{fb.strengths}</p>
                        </div>
                      )}
                      {fb.areas_of_improvement && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600 mb-1">Areas for Improvement</p>
                          <p className="text-sm text-gray-700">{fb.areas_of_improvement}</p>
                        </div>
                      )}
                      {fb.feedback_comments && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600 mb-1">Detailed Feedback</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {fb.feedback_comments}
                          </p>
                        </div>
                      )}
                      {fb.hr_notes && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">HR Notes</p>
                          <p className="text-sm text-gray-700">{fb.hr_notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CandidateScorecard;
