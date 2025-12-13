import ApplicationsTable from "../../components/applications/ApplicationsTable";

const ApplicationsListPage = () => {
  return (
    <div className="min-h-screen pt-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-2">
            Manage and track all job applications
          </p>
        </div>
        <ApplicationsTable />
      </div>
    </div>
  );
};

export default ApplicationsListPage;
