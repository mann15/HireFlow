import { useState, useEffect } from "react";
import { getInterviewsByApplication } from "../../services/interviewService";
import { format } from "date-fns";

const InterviewsList = ({ applicationId }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (applicationId && applicationId !== "undefined" && applicationId !== "null") {
      fetchInterviews();
    }
  }, [applicationId]);

  const fetchInterviews = async () => {
    if (!applicationId || applicationId === "undefined" || applicationId === "null") {
      return;
    }
    setLoading(true);
    try {
      const data = await getInterviewsByApplication(applicationId);
      setInterviews(data);
    } catch (err) {
      setError("Failed to fetch interviews");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      SCHEDULED: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      RESCHEDULED: "bg-yellow-100 text-yellow-800",
      CANCELED: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading interviews...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-4">{error}</div>;
  }

  if (interviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No interviews scheduled yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Interview History</h3>
      {interviews.map((interview) => (
        <div
          key={interview.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              {/* <pre>{JSON.stringify(interview, null, 2)}</pre> */}
              <h4 className="font-semibold text-lg">
                {interview.round.roundName}
              </h4>
              <p className="text-sm text-gray-600">{interview.round.roundType}</p>
            </div>
            {getStatusBadge(interview.status)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Date:</span>{" "}
              <span className="font-medium">
                {interview.interviewDate
                  ? format(new Date(interview.interviewDate), "PPP p")
                  : "Not scheduled"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Mode:</span>{" "}
              <span className="font-medium">{interview.interviewMode}</span>
            </div>
            {interview.interviewLink && (
              <div className="md:col-span-2">
                <span className="text-gray-600">Link:</span>{" "}
                <a
                  href={interview.interviewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  Join Interview
                </a>
              </div>
            )}
            {interview.location && (
              <div className="md:col-span-2">
                <span className="text-gray-600">Location:</span>{" "}
                <span className="font-medium">{interview.location}</span>
              </div>
            )}
          </div>

          {interview.panelists && interview.panelists.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-1">Interviewers:</p>
              <div className="flex flex-wrap gap-2">
                {interview.panelists.map((panelist) => (
                  <span
                    key={panelist.userId}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {panelist.userName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {interview.feedbacks && interview.feedbacks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-sm font-medium mb-2">Feedback:</p>
              {interview.feedbacks.map((feedback, idx) => (
                <div key={idx} className="bg-gray-50 rounded p-3 mb-2">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">
                      {feedback.reviewerName}
                    </span>
                    <span className="text-sm">
                      Rating:{" "}
                      <span className="font-bold">
                        {feedback.overallRating}/5
                      </span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">
                    {feedback.feedbackComments}
                  </p>
                  <p className="text-xs">
                    <span className="text-gray-600">Recommendation:</span>{" "}
                    <span className="font-medium">
                      {feedback.recommendation}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}

          {interview.completedAt && (
            <div className="mt-2 text-xs text-gray-500">
              Completed: {format(new Date(interview.completedAt), "PPP p")}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InterviewsList;
