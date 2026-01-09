import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUnreadCount,
  fetchNotifications,
  markNotificationAsRead,
} from "../../redux/thunks/notificationThunks";
import { Link } from "react-router-dom";

const NotificationBell = () => {
  const dispatch = useDispatch();
  const { unreadCount, notifications } = useSelector((state) => state.notification);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchUnreadCount());
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (showDropdown) {
      dispatch(fetchNotifications(false)); // Fetch unread only
    }
  }, [dispatch, showDropdown]);

  const recentNotifications = notifications.slice(0, 5); // Show only 5 recent

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await dispatch(markNotificationAsRead(notificationId));
      dispatch(fetchUnreadCount());
      dispatch(fetchNotifications(false));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      APPLICATION_STATUS: "📝",
      INTERVIEW_SCHEDULED: "📅",
      DOCUMENT_VERIFICATION: "📄",
      OFFER_GENERATED: "💼",
      CANDIDATE_HISTORY: "🔍",
      GENERAL: "ℹ️",
    };
    return icons[category] || "📢";
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        {/* Bell Icon */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Overlay to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />

          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">Notifications</h3>
              <Link
                to="/notifications"
                onClick={() => setShowDropdown(false)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </Link>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {recentNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No new notifications
                </div>
              ) : (
                <div className="divide-y">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">
                          {getCategoryIcon(notification.notificationCategory)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.notificationCategory}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Mark as read"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {recentNotifications.length > 0 && (
              <div className="p-3 border-t text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowDropdown(false)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  See all notifications →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
