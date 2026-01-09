import React, { useState } from "react";
import GenerateOffer from "../../components/offers/GenerateOffer";
import OffersList from "../../components/offers/OffersList";

const OffersPage = () => {
  const [applicationId, setApplicationId] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [positionTitle, setPositionTitle] = useState("");

  return (
    <div className="min-h-screen pt-24 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Offer Letters</h1>
          <p className="text-gray-600 mt-2">
            Generate, send, and track offers. Set joining dates to move selected
            candidates to employee records after acceptance.
          </p>
        </header>

        <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application ID
            </label>
            <input
              type="number"
              min="1"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-40"
              placeholder="e.g., 101"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Candidate Name (optional)
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
              placeholder="Display name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position Title (optional)
            </label>
            <input
              type="text"
              value={positionTitle}
              onChange={(e) => setPositionTitle(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., SDE II"
            />
          </div>
        </div>

        {applicationId ? (
          <div className="space-y-6">
            <GenerateOffer
              applicationId={applicationId}
              candidateName={candidateName}
              positionTitle={positionTitle}
            />
            <OffersList applicationId={applicationId} isHR />
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Enter an application ID to manage offers.
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersPage;
