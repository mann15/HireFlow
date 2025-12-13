import NotificationCenter from "../../components/notifications/NotificationCenter";

const NotificationsPage = () => {
  return (
    <div className="min-h-screen pt-24 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">
            Stay updated with all recruitment activities
          </p>
        </div>
        <NotificationCenter />
      </div>
    </div>
  );
};

export default NotificationsPage;
