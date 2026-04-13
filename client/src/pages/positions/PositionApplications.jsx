import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getApplicationsByPosition } from "../../services/positionService";

const STATUSES = [
  { id: "APPLIED", label: "Applied", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "SCREENING", label: "Screening", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { id: "INTERVIEW", label: "Interview", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { id: "SELECTED", label: "Selected", color: "bg-green-100 text-green-800 border-green-200" },
  { id: "ON_HOLD", label: "On Hold", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { id: "REJECTED", label: "Rejected", color: "bg-red-100 text-red-800 border-red-200" },
];

const PositionApplications = () => {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const apps = await getApplicationsByPosition(id);
        setApplications(apps || []);
      } catch (err) {
        console.error("Failed to fetch applications", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const appsByStatus = STATUSES.map(s => ({
    ...s,
    items: applications.filter(a => a.status === s.id)
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Application Pipeline</h2>
          <p className="text-gray-500 mt-1">Track candidates through the hiring process</p>
        </div>
        <Link
          to={`/positions/${id}`}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          Back to Position
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
          <p className="text-gray-500 mt-1">Share this position to start receiving applications.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max h-full items-start">
            {appsByStatus.map(statusData => (
              <div 
                key={statusData.id} 
                className="w-80 bg-gray-50/50 rounded-xl flex flex-col border border-gray-100"
              >
                <div className="p-3 bg-white border-b border-gray-100 rounded-t-xl sticky top-0 z-10 flex items-center justify-between">
                  <div className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${statusData.color}`}>
                    {statusData.label}
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {statusData.items.length}
                  </span>
                </div>
                
                <div className="p-3 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[150px]">
                  {statusData.items.map(app => (
                    <div 
                      key={app.applicationId}
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group cursor-pointer relative"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {app.candidate?.firstName} {app.candidate?.lastName}
                        </h4>
                        <Link
                          to={`/review/application/${app.applicationId}`}
                          className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 transition-opacity bg-blue-50 p-1.5 rounded-lg text-xs"
                          title="Review Application"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                        </Link>
                      </div>
                      <div className="text-xs text-gray-500 mb-3 flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                      </div>
                      
                      {app.currentStage && (
                        <div className="mt-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block">
                          Stage: {app.currentStage}
                        </div>
                      )}
                    </div>
                  ))}
                  {statusData.items.length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-6 text-gray-400 text-xs text-center font-medium">
                      No candidates in this stage
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionApplications;
