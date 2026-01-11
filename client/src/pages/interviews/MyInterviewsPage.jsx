import { useState, useEffect } from "react";
import { getMyInterviews } from "../../services/interviewService";
import { feedbackService } from "../../services/apiService";
import { useSelector } from "react-redux";
import InterviewFeedback from "../../components/interviews/InterviewFeedback";
import { format } from "date-fns";

const MyInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const currentUserId = useSelector((state) => state.user?.currentUser?.userId);

  useEffect(() => {
    fetchMyInterviews();
  }, []);

  const fetchMyInterviews = async () => {
    setLoading(true);
    try {
      const data = await getMyInterviews();
      // Fetch feedback for each interview; attach myFeedback if present
      const withFeedback = await Promise.all(
        (data || []).map(async (interview) => {
          const id = interview.interviewId || interview.id;
          try {
            const feedbacks = await feedbackService.getInterviewFeedback(id);
            const myFb = Array.isArray(feedbacks)
              ? feedbacks
                  .filter((f) => f?.panelist?.userId === currentUserId)
                  .sort((a, b) => (a.id || 0) - (b.id || 0))
                  .slice(-1)[0] || null
              : null;
            return { ...interview, myFeedback: myFb, allFeedback: feedbacks };
          } catch (e) {
            return { ...interview, myFeedback: null, allFeedback: [] };
          }
        })
      );
      setInterviews(withFeedback);
    } catch (err) {
      console.error("Failed to fetch interviews:", err);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      SCHEDULED: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      RESCHEDULED: "bg-yellow-100 text-yellow-800",
      CANCELED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen pt-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Interviews</h1>
          <p className="text-gray-600 mt-2">
            Interviews where you are assigned as a panelist
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading interviews...</div>
        ) : interviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            No interviews assigned to you
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview) => (
              <div
                key={interview.interviewId || interview.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {interview.round.roundName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {interview.round.roundType}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      interview.status
                    )}`}
                  >
                    {interview.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Candidate</p>
                    <p className="font-medium">
                      {interview.application.candidate.firstName}{" "}
                      {interview.application.candidate.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Position</p>
                    <p className="font-medium">
                      {interview.application.position.jobTitle}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-medium">
                      {interview.interviewDate
                        ? format(new Date(interview.interviewDate), "PPP p")
                        : "Not scheduled"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mode</p>
                    <p className="font-medium">{interview.interviewMode}</p>
                  </div>
                </div>

                {interview.interviewLink && (
                  <div className="mb-4">
                    <a
                      href={interview.interviewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Join Interview →
                    </a>
                  </div>
                )}

                {!interview.myFeedback && interview.status !== "CANCELED" && (
                  <button
                    onClick={() => {
                      setSelectedInterview({
                        ...interview,
                        interviewId: interview.interviewId || interview.id,
                      });
                      setShowFeedbackModal(true);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Submit Feedback
                  </button>
                )}

                {interview.myFeedback && (
                  <div className="border border-gray-200 rounded p-3 text-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Your Feedback</span>
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                          onClick={() => {
                            setSelectedInterview({
                              ...interview,
                              interviewId:
                                interview.interviewId || interview.id,
                            });
                            setShowFeedbackModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="px-2 py-1 text-xs border rounded hover:bg-red-50 text-red-700"
                          onClick={async () => {
                            try {
                              const id = interview.interviewId || interview.id;
                              const fbId = interview.myFeedback?.id;
                              if (!fbId) return;
                              await feedbackService.deleteInterviewFeedback(
                                id,
                                fbId
                              );
                              await fetchMyInterviews();
                            } catch (e) {
                              console.error("Failed to delete feedback", e);
                              alert(
                                e?.response?.data?.error ||
                                  "Failed to delete feedback"
                              );
                            }
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Recommendation:</span>
                      <span className="ml-2 font-medium">
                        {interview.myFeedback.recommendation}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Overall:</span>
                      <span className="ml-2 font-medium">
                        {interview.myFeedback.overall_rating}
                      </span>
                    </div>
                    {interview.myFeedback.feedback_comments && (
                      <div className="text-gray-700">
                        {interview.myFeedback.feedback_comments}
                      </div>
                    )}
                    {interview.myFeedback.hr_notes && (
                      <div className="text-gray-700">
                        <span className="text-gray-600">
                          HR/Reviewer Notes:
                        </span>
                        <span className="ml-2">
                          {interview.myFeedback.hr_notes}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && selectedInterview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <InterviewFeedback
                interviewId={
                  selectedInterview.interviewId || selectedInterview.id
                }
                candidateName={selectedInterview.candidateName}
                initialData={selectedInterview.myFeedback}
                onComplete={() => {
                  setShowFeedbackModal(false);
                  setSelectedInterview(null);
                  fetchMyInterviews();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInterviewsPage;
