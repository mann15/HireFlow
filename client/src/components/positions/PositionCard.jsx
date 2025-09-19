import React from "react";
import { Link } from "react-router-dom";

const PositionCard = ({ position }) => {
  return (
    <div className="border p-4 rounded flex justify-between items-center">
      <div>
        <div className="font-medium text-lg">{position.jobTitle}</div>
        <div className="text-sm text-gray-600">{position.department}</div>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`px-2 py-1 rounded text-sm ${
            position.status === "OPEN"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {position.status || "OPEN"}
        </div>
        <Link
          to={`/positions/${position.positionId}`}
          className="text-blue-600"
        >
          View
        </Link>
      </div>
    </div>
  );
};

export default PositionCard;
