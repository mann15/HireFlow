import React, { useState } from "react";


const OnlineAssessmentsAdmin = () => {

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Online Examination Module</h2>
          <p className="text-gray-500 mt-1">Manage tests and assessments for pre-interview screening.</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6 flex items-start">
        <svg className="w-5 h-5 mr-3 mt-0.5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <div>
         coming soon
        </div>
      </div>
    </div>
  );
};

export default OnlineAssessmentsAdmin;
