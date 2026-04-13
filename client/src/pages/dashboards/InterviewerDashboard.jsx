import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { interviewService } from "../../services/apiService";
import { INTERVIEW_STATUS } from "../../utils/constants";
import Loader from "../../components/Loader";

const InterviewerDashboard = () => {
  const [stats, setStats] = useState({
    scheduledInterviews: 0,
    pendingFeedback: 0,
    completedInterviews: 0,
    upcomingToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const unwrapList = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.content)) return value.content;
    return [];
  };

  const formatInterviewDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
  };

  const getInterviewCandidateName = (interview) => {
    const firstName = interview?.application?.candidate?.firstName;
    const lastName = interview?.application?.candidate?.lastName;
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    return fullName || interview?.candidateName || "N/A";
  };

  const getInterviewPositionTitle = (interview) => {
    return (
      interview?.application?.position?.jobTitle ||
      interview?.position?.jobTitle ||
      interview?.position ||
      "N/A"
    );
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const interviews = unwrapList(
        await interviewService.getMyInterviews().catch(() => []),
      );

      const today = new Date().toDateString();
      const todayInterviews = interviews.filter((interview) => {
        const interviewDate = new Date(interview.interviewDate);
        return (
          !Number.isNaN(interviewDate.getTime()) &&
          interviewDate.toDateString() === today
        );
      });

      const scheduled = interviews.filter(
        (interview) => interview.status === INTERVIEW_STATUS.SCHEDULED,
      );

      const pending = interviews.filter(
        (interview) =>
          interview.status === INTERVIEW_STATUS.SCHEDULED &&
          !interview.feedback,
      );

      const completed = interviews.filter(
        (interview) => interview.status === INTERVIEW_STATUS.COMPLETED,
      );

      setStats({
        scheduledInterviews: scheduled.length,
        pendingFeedback: pending.length,
        completedInterviews: completed.length,
        upcomingToday: todayInterviews.length,
      });

      setUpcomingInterviews(
        scheduled.slice(0, 5).map((interview) => ({
          id: interview.interviewId || interview.id,
          candidateName: getInterviewCandidateName(interview),
          position: getInterviewPositionTitle(interview),
          scheduledDate: formatInterviewDate(interview.interviewDate),
        })),
      );
    } catch (err) {
      console.error("Failed to load interviewer dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="container mx-auto px-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <h1 className="text-3xl font-bold mb-8">Interviewer Dashboard</h1>

        <div className="mb-8">
          <Link
            to="/interviews/my"
            className="inline-flex items-center px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Open My Interviews
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Scheduled Interviews</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.scheduledInterviews}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Feedback</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.pendingFeedback}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed Interviews</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.completedInterviews}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Today</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.upcomingToday}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Interviews scheduled today
            </p>
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Upcoming Interviews</h2>
          {upcomingInterviews.length > 0 ? (
            <div className="space-y-3">
              {upcomingInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div>
                    <p className="font-medium">{interview.candidateName}</p>
                    <p className="text-sm text-gray-500">
                      {interview.position}
                    </p>
                    <p className="text-xs text-gray-400">
                      {interview.scheduledDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming interviews</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewerDashboard;
