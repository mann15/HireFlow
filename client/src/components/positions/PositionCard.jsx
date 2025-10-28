import React from "react";
import { Link } from "react-router-dom";

const PositionCard = ({ position }) => {
  const formatSalary = (min, max) => {
    if (!min && !max) return "Salary not specified";
    if (min && max)
      return `${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `From ${min.toLocaleString()}`;
    if (max) return `Up to ${max.toLocaleString()}`;
  };

  const formatExperience = (min, max) => {
    if (!min && !max) return "No experience required";
    if (min && max) return `${min}-${max} years`;
    if (min) return `${min}+ years`;
    if (max) return `Up to ${max} years`;
    return "Experience not specified";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-800";
      case "ON_HOLD":
        return "bg-yellow-100 text-yellow-800";
      case "CLOSED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEmploymentTypeColor = (type) => {
    switch (type) {
      case "FULL_TIME":
        return "bg-blue-100 text-blue-800";
      case "PART_TIME":
        return "bg-purple-100 text-purple-800";
      case "CONTRACT":
        return "bg-orange-100 text-orange-800";
      case "INTERNSHIP":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {position.jobTitle}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{position.department}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                position.status
              )}`}
            >
              {position.status?.replace("_", " ") || "OPEN"}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getEmploymentTypeColor(
                position.employmentType
              )}`}
            >
              {position.employmentType?.replace("_", " ") || "FULL_TIME"}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-700 line-clamp-3">
            {position.jobDescription?.substring(0, 150)}
            {position.jobDescription?.length > 150 && "..."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-500">Experience:</span>
            <p className="font-medium text-gray-900">
              {formatExperience(
                position.experienceRequiredMin,
                position.experienceRequiredMax
              )}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Salary:</span>
            <p className="font-medium text-gray-900">
              {formatSalary(position.salaryMin, position.salaryMax)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {position.totalPositions > 1
              ? `${position.totalPositions} positions`
              : "1 position"}
          </div>
          <div className="flex space-x-2">
            <Link
              to={`/positions/${position.positionId}/edit`}
              className="px-3 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors duration-150"
            >
              Edit
            </Link>
            <Link
              to={`/positions/${position.positionId}`}
              className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-150"
            >
              View Details
            </Link>
          </div>
        </div>

        {position.closureReason && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-600">
              <span className="font-medium">Reason:</span>{" "}
              {position.closureReason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PositionCard;
