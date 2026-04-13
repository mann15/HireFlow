import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { interviewService, candidateService } from "../../services/apiService";
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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const interviews = await interviewService
        .getMyInterviews()
        .catch(() => []);

      const today = new Date().toDateString();
      const todayInterviews = Array.isArray(interviews)
        ? interviews.filter((i) => {
            const interviewDate = new Date(i.scheduledDate).toDateString();
            return interviewDate === today;
          })
        : [];

      const scheduled = Array.isArray(interviews)
        ? interviews.filter((i) => i.status === "SCHEDULED")
        : [];

      const pending = Array.isArray(interviews)
        ? interviews.filter((i) => i.status === "SCHEDULED" && !i.feedback)
        : [];

      const completed = Array.isArray(interviews)
        ? interviews.filter((i) => i.status === "COMPLETED")
        : [];

      setStats({
        scheduledInterviews: scheduled.length,
        pendingFeedback: pending.length,
        completedInterviews: completed.length,
        upcomingToday: todayInterviews.length,
      });

      setUpcomingInterviews(
        scheduled.slice(0, 5).map((i) => ({
          id: i.id,
          candidateName: i.candidateName || "N/A",
          position: i.position || "N/A",
          scheduledDate: new Date(i.scheduledDate).toLocaleString(),
        }))
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
            <Link
              to="/interviews/my"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              View Interviews →
            </Link>
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
            <Link
              to="/interviews/my"
              className="mt-4 inline-block text-orange-600 hover:text-orange-800 font-medium text-sm"
            >
              Add Feedback →
            </Link>
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
            <Link
              to="/interviews/my"
              className="mt-4 inline-block text-green-600 hover:text-green-800 font-medium text-sm"
            >
              View History →
            </Link>
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

        {/* Task Center */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h2 className="text-xl font-bold flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              My Task Center
            </h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {stats.pendingFeedback} Action(s) Required
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Today's Schedule</h3>
              {upcomingInterviews.length > 0 ? (
                <div className="grid gap-3">
                  {upcomingInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-white p-2 border rounded-md text-center min-w-[60px]">
                          <span className="block text-xs text-gray-500">{new Date(interview.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{interview.candidateName}</p>
                          <p className="text-sm text-gray-500">{interview.position}</p>
                        </div>
                      </div>
                      <Link
                        to={`/interviews/${interview.id}`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition shadow-sm"
                      >
                        Join / Start
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <p className="text-gray-500 text-sm">No interviews scheduled for today.</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-3">Pending Feedback</h3>
              {stats.pendingFeedback > 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-red-800">You have {stats.pendingFeedback} interview(s) missing feedback</h4>
                    <p className="text-sm text-red-600 mt-1">Please submit your evaluations to unblock the recruitment process.</p>
                  </div>
                  <Link
                    to="/interviews/my"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition shadow-sm whitespace-nowrap"
                  >
                    Complete Feedback
                  </Link>
                </div>
              ) : (
                <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-lg border border-green-200 text-sm">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  All caught up! No pending feedback required.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewerDashboard;
