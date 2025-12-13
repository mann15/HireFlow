import React, { useState, useEffect } from "react";
import { candidateService } from "../../services/candidateService";

const MatchingCandidates = ({ positionId }) => {
  const [candidates, setCandidates] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("match");
  const [filtering, setFiltering] = useState("all");
  const [linking, setLinking] = useState(false);
  const [showAllCandidates, setShowAllCandidates] = useState(false);
  const [allCandidateFilter, setAllCandidateFilter] = useState("");
  const [allCandidateSort, setAllCandidateSort] = useState("name");

  useEffect(() => {
    fetchMatchingCandidates();
    fetchAllCandidates();
  }, [positionId]);

  const fetchMatchingCandidates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/candidates/matching/${positionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch matching candidates");
      }
      const data = await response.json();
      setCandidates(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCandidates = async () => {
    try {
      // If you have an endpoint to get all candidates, use it
      const response = await fetch("/api/candidates");
      if (response.ok) {
        const data = await response.json();
        // Filter out candidates that are already in matching list
        const matchingIds = new Set(
          candidates.map((c) => c.candidate.candidateId)
        );
        const unlinkedCandidates = data.filter(
          (c) => !matchingIds.has(c.candidateId)
        );
        setAllCandidates(unlinkedCandidates);
      }
    } catch (err) {
      console.error("Failed to fetch all candidates:", err);
    }
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case "Excellent":
        return "bg-green-100 text-green-800";
      case "Good":
        return "bg-blue-100 text-blue-800";
      case "Fair":
        return "bg-yellow-100 text-yellow-800";
      case "Poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleLinkCandidate = async (candidateId) => {
    setLinking(true);
    try {
      // Ensure positionId is a number
      const numPositionId =
        typeof positionId === "string" ? parseInt(positionId) : positionId;

      if (!numPositionId || isNaN(numPositionId)) {
        throw new Error("Invalid position ID");
      }

      // Create application linking candidate to position
      const response = await fetch(`/api/candidates/${candidateId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          positionId: numPositionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to link candidate");
      }

      const application = await response.json();
      alert("Candidate linked to position successfully!");
      // Refresh the list
      fetchMatchingCandidates();
    } catch (err) {
      alert("Failed to link candidate: " + err.message);
    } finally {
      setLinking(false);
    }
  };

  const filteredCandidates = candidates.filter((item) => {
    if (filtering === "excellent") return item.matchQuality === "Excellent";
    if (filtering === "good") return item.matchQuality === "Good";
    if (filtering === "matched-mandatory")
      return item.mandatorySkillsMatched === item.mandatorySkillsRequired;
    return true;
  });

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === "match") {
      return b.matchPercentage - a.matchPercentage;
    } else if (sortBy === "experience") {
      return (
        (b.candidate.totalExperience || 0) - (a.candidate.totalExperience || 0)
      );
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="text-gray-600 mt-2">Finding matching candidates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Matching Candidates
            {candidates.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({candidates.length} candidates found)
              </span>
            )}
          </h2>
          <button
            onClick={fetchMatchingCandidates}
            className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 border border-indigo-600 rounded-md hover:bg-indigo-50"
          >
            Refresh
          </button>
        </div>

        {candidates.length > 0 && (
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="match">Match Score (High to Low)</option>
                <option value="experience">Experience (High to Low)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter By
              </label>
              <select
                value={filtering}
                onChange={(e) => setFiltering(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Candidates</option>
                <option value="excellent">Excellent Match</option>
                <option value="good">Good Match</option>
                <option value="matched-mandatory">All Mandatory Skills</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {sortedCandidates.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          {candidates.length === 0
            ? "No candidates match this position"
            : "No candidates match the selected filter"}
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {sortedCandidates.map((item) => (
            <div
              key={item.candidate.candidateId}
              className="p-6 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.candidate.firstName} {item.candidate.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {item.candidate.email}
                  </p>
                  {item.candidate.phone && (
                    <p className="text-sm text-gray-600">
                      {item.candidate.phone}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getQualityColor(
                      item.matchQuality
                    )}`}
                  >
                    {item.matchQuality}
                  </span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {item.matchPercentage}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-600">Skills Matched</p>
                  <p className="font-semibold text-gray-900">
                    {item.mandatorySkillsMatched}/{item.mandatorySkillsRequired}{" "}
                    mandatory
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Experience</p>
                  <p
                    className={`font-semibold ${
                      item.experienceMatch ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.candidate.totalExperience || "N/A"} years{" "}
                    {item.experienceMatch ? "✓" : "✗"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Salary Expectation</p>
                  <p
                    className={`font-semibold ${
                      item.salaryMatch ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.candidate.expectedSalary
                      ? `$${item.candidate.expectedSalary}`
                      : "N/A"}{" "}
                    {item.salaryMatch ? "✓" : "✗"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Current Location</p>
                  <p className="font-semibold text-gray-900">
                    {item.candidate.currentLocation || "N/A"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() =>
                    handleLinkCandidate(item.candidate.candidateId)
                  }
                  disabled={linking}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {linking ? "Linking..." : "Link to Position"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {candidates.length === 0 && (
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            All Available Candidates
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            No candidates matched automatically. Browse all candidates below to
            manually link them to this position.
          </p>

          {allCandidates.length > 0 && (
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={allCandidateSort}
                  onChange={(e) => setAllCandidateSort(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="experience">Experience (High to Low)</option>
                  <option value="recent">Recent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={allCandidateFilter}
                  onChange={(e) => setAllCandidateFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
            {allCandidates.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No candidates available
              </div>
            ) : (
              (() => {
                let filtered = allCandidates.filter((c) => {
                  const searchText = allCandidateFilter.toLowerCase();
                  return (
                    c.firstName?.toLowerCase().includes(searchText) ||
                    c.lastName?.toLowerCase().includes(searchText) ||
                    c.email?.toLowerCase().includes(searchText)
                  );
                });

                let sorted = [...filtered].sort((a, b) => {
                  if (allCandidateSort === "name") {
                    return `${a.firstName} ${a.lastName}`.localeCompare(
                      `${b.firstName} ${b.lastName}`
                    );
                  } else if (allCandidateSort === "experience") {
                    return (b.totalExperience || 0) - (a.totalExperience || 0);
                  } else if (allCandidateSort === "recent") {
                    return (
                      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                    );
                  }
                  return 0;
                });

                return sorted.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No candidates match search criteria
                  </div>
                ) : (
                  sorted.map((candidate) => (
                    <div
                      key={candidate.candidateId}
                      className="p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {candidate.firstName} {candidate.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {candidate.email}
                          </p>
                          {candidate.phone && (
                            <p className="text-sm text-gray-600">
                              {candidate.phone}
                            </p>
                          )}
                          {candidate.totalExperience && (
                            <p className="text-sm text-gray-600">
                              Experience: {candidate.totalExperience} years
                            </p>
                          )}
                          {candidate.currentLocation && (
                            <p className="text-sm text-gray-600">
                              Location: {candidate.currentLocation}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            handleLinkCandidate(candidate.candidateId)
                          }
                          disabled={linking}
                          className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition whitespace-nowrap"
                        >
                          {linking ? "Linking..." : "Link"}
                        </button>
                      </div>
                    </div>
                  ))
                );
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingCandidates;
