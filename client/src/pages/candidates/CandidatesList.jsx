import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { candidateService } from "../../services/candidateService";
import Loader from "../../components/Loader";
import BulkUploadCandidates from "../../components/candidates/BulkUploadCandidates";
import CVUpload from "../../components/candidates/CVUpload";

const CandidatesList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showCreateFromCV, setShowCreateFromCV] = useState(false);
  const [searchParams, setSearchParams] = useState({
    name: "",
    location: "",
    minExp: "",
    maxExp: "",
    maxSalary: "",
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const data = await candidateService.getAllCandidates();
      setCandidates(data);
    } catch (err) {
      setError(err.error || "Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(searchParams).filter(([_, value]) => value !== "")
      );
      const data = await candidateService.searchCandidates(params);
      setCandidates(data);
    } catch (err) {
      setError(err.error || "Failed to search candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchParams({
      name: "",
      location: "",
      minExp: "",
      maxExp: "",
      maxSalary: "",
    });
    fetchCandidates();
  };

  const handleBulkUploadComplete = (newCandidates) => {
    setCandidates((prev) => [...prev, ...newCandidates]);
    setShowBulkUpload(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Candidate Database
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowBulkUpload(!showBulkUpload)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
            >
              {showBulkUpload ? "Hide Bulk Upload" : "Bulk Upload"}
            </button>
            <button
              onClick={() => setShowCreateFromCV(!showCreateFromCV)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium"
            >
              {showCreateFromCV ? "Hide Create from CV" : "Create from CV"}
            </button>
            <Link
              to="/candidates/add"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
            >
              Add New Candidate
            </Link>
          </div>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Search Candidates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={searchParams.name}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={searchParams.location}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, location: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Experience
              </label>
              <input
                type="number"
                value={searchParams.minExp}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, minExp: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Years"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Experience
              </label>
              <input
                type="number"
                value={searchParams.maxExp}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, maxExp: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Years"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Salary
              </label>
              <input
                type="number"
                value={searchParams.maxSalary}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    maxSalary: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="LPA"
              />
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Search
            </button>
            <button
              onClick={handleClearSearch}
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition duration-200"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Bulk Upload Section */}
        {showBulkUpload && (
          <div className="mb-8">
            <BulkUploadCandidates onUploadComplete={handleBulkUploadComplete} />
          </div>
        )}

        {/* Create from CV Section */}
        {showCreateFromCV && (
          <div className="mb-8">
            {/* CVUpload without candidateId will create a candidate from the uploaded CV */}
            <CVUpload
              onUploadComplete={(res) => {
                // when create-from-cv completes, if it returns a candidate, add to list
                if (res && res.candidate) {
                  setCandidates((prev) => [...prev, res.candidate]);
                } else if (res && res.cv && res.cv.candidate) {
                  setCandidates((prev) => [...prev, res.cv.candidate]);
                }
                setShowCreateFromCV(false);
              }}
            />
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <div
              key={candidate.candidateId}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {candidate.firstName} {candidate.lastName}
                  </h3>
                  <p className="text-gray-600">{candidate.email}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    candidate.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {candidate.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Experience:</span>{" "}
                  {candidate.totalExperience} years
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Location:</span>{" "}
                  {candidate.currentLocation || "Not specified"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Expected Salary:</span>{" "}
                  {candidate.expectedSalary
                    ? `₹${candidate.expectedSalary} LPA`
                    : "Not specified"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Source:</span>{" "}
                  {candidate.source.replace("_", " ")}
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/candidates/${candidate.candidateId}`}
                  className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 text-sm"
                >
                  View Profile
                </Link>
                <Link
                  to={`/candidates/${candidate.candidateId}/edit`}
                  className="flex-1 bg-gray-600 text-white text-center py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200 text-sm"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>

        {candidates.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No candidates found</p>
            <Link
              to="/candidates/add"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Add the first candidate
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidatesList;
