import React from 'react';
import { FaCheck, FaTimes, FaCircle, FaSpinner } from 'react-icons/fa';

const STEPS = [
  { id: 'APPLIED', label: 'Applied' },
  { id: 'SCREENING', label: 'Under Review' },
  { id: 'INTERVIEW', label: 'Interview' },
  { id: 'SELECTED', label: 'Selected' }
];

const ApplicationProgressTracker = ({ status, stage, rejectionReason }) => {
  if (status === 'REJECTED') {
    return (
      <div className="w-full py-4 px-2">
        <div className="flex items-center text-red-600 mb-2 font-medium">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Application Unsuccessful
        </div>
        <p className="text-sm text-gray-600">Unfortunately, we have decided not to move forward with your application at this time.</p>
        {rejectionReason && <p className="text-sm text-gray-600 mt-1 italic">"{rejectionReason}"</p>}
      </div>
    );
  }

  if (status === 'WITHDRAWN') {
    return (
      <div className="w-full py-4 px-2">
        <div className="flex items-center text-gray-600 mb-2 font-medium">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Application Withdrawn
        </div>
      </div>
    );
  }

  const getCurrentStepIndex = () => {
    switch (status) {
      case 'APPLIED': return 0;
      case 'SCREENING': return 1;
      case 'INTERVIEW': return 2;
      case 'SELECTED': return 3;
      case 'ON_HOLD': return -1; // Special rendering
      default: return 0;
    }
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="w-full py-4">
      {status === 'ON_HOLD' && (
        <div className="mb-4 bg-yellow-50 text-yellow-800 p-3 rounded border border-yellow-200 text-sm">
          <strong>On Hold:</strong> Your application is currently pausing progression.
        </div>
      )}
      
      <div className="relative flex justify-between items-center w-full">
        {/* Connection Line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded"></div>
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-500 z-0 rounded transition-all duration-500" 
          style={{ width: `${Math.max(0, (currentIndex / (STEPS.length - 1)) * 100)}%` }}
        ></div>

        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex && status !== 'ON_HOLD';
          const isPending = index > currentIndex || status === 'ON_HOLD';

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  isCompleted 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : isCurrent
                      ? 'bg-white border-blue-500 text-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]'
                      : 'bg-white border-gray-300 text-gray-300'
                }`}
              >
                {isCompleted ? (
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                ) : isCurrent ? (
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-transparent"></span>
                )}
              </div>
              <span 
                className={`mt-2 text-xs font-semibold absolute top-8 whitespace-nowrap ${
                  isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-8"></div> {/* Spacer for labels */}
      
      {isCurrentStepWaitingForAction(status, stage) && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center text-sm text-blue-700 font-medium animate-pulse">
           <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           Action required on your end for the next step. Please check details.
        </div>
      )}
    </div>
  );
};

// Helper function to show CTA prompt if we know user needs to do something based on stage
function isCurrentStepWaitingForAction(status, stage) {
  if (status === 'SELECTED' && stage === 'DOCUMENT_VERIFICATION') return true;
  return false;
}

export default ApplicationProgressTracker;
