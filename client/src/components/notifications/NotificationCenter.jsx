import { useState, useEffect } from "react";
import {
  getUnreadNotifications,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../../services/notificationService";
import { format } from "date-fns";

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    // Refresh notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [showAll]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = showAll
        ? await getMyNotifications()
        : await getUnreadNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await fetchNotifications();
      await fetchUnreadCount();
      alert("All notifications marked as read");
    } catch (err) {
      alert("Failed to mark all as read");
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      INFO: "bg-blue-100 text-blue-800",
      WARNING: "bg-yellow-100 text-yellow-800",
      SUCCESS: "bg-green-100 text-green-800",
      ERROR: "bg-red-100 text-red-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
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
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
              {unreadCount}
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showAll ? "Show Unread Only" : "Show All"}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {showAll ? "No notifications" : "No unread notifications"}
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 ${
                !notification.isRead
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white border-gray-200"
              } hover:shadow-md transition`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">
                    {getCategoryIcon(notification.notificationCategory)}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(
                          notification.notificationType
                        )}`}
                      >
                        {notification.notificationType}
                      </span>
                      <span className="text-xs text-gray-500">
                        {notification.notificationCategory}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium mb-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {notification.createdAt
                        ? format(new Date(notification.createdAt), "PPP p")
                        : "Just now"}
                    </p>
                  </div>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap ml-2"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
