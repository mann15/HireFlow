import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getPositionById,
  getApplicationsByPosition,
  getPositionSkills,
} from "../../services/positionService";

const PositionDetails = () => {
  const { id } = useParams();
  const [position, setPosition] = useState(null);
  const [applications, setApplications] = useState([]);
  const [skills, setSkills] = useState({ required: [], preferred: [] });

  useEffect(() => {
    fetch();
  }, [id]);

  const fetch = async () => {
    try {
      const pos = await getPositionById(id);
      setPosition(pos);
      const apps = await getApplicationsByPosition(id);
      setApplications(apps || []);
      // fetch skills (required / preferred)
      try {
        const sk = await getPositionSkills(id);
        // backend returns { required: [...], preferred: [...] }
        setSkills({
          required: sk.required || [],
          preferred: sk.preferred || [],
        });
      } catch (sErr) {
        console.warn("Could not fetch position skills", sErr);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!position) return <div className="container p-6">Loading...</div>;

  return (
    <div className="container mx-auto p-6 mt-20">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold">{position.jobTitle}</h2>
          <p className="text-sm text-gray-600">
            Status: {position.status || "OPEN"}
          </p>
        </div>

        <div className="space-x-2">
          <Link
            to={`/positions/${position.positionId}/edit`}
            className="px-3 py-1 rounded bg-yellow-500 text-white"
          >
            Edit
          </Link>
          <Link
            to={`/positions/${position.positionId}/applications`}
            className="px-3 py-1 rounded bg-blue-600 text-white"
          >
            Applications ({applications.length})
          </Link>
          <Link
            to={`/positions/${position.positionId}/analytics`}
            className="px-3 py-1 rounded bg-green-600 text-white"
          >
            Analytics
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-medium">Description</h3>
          <p className="whitespace-pre-wrap">{position.jobDescription}</p>
        </div>

        <div>
          <h3 className="font-medium">Details</h3>
          <ul className="text-sm text-gray-700 mt-2 space-y-2">
            <li>
              <strong>Department:</strong> {position.department || "-"}
            </li>
            <li>
              <strong>Employment Type:</strong> {position.employmentType || "-"}
            </li>
            <li>
              <strong>Experience:</strong> {position.experienceRequiredMin ?? 0}{" "}
              - {position.experienceRequiredMax ?? 0} years
            </li>
            <li>
              <strong>Salary Range:</strong>{" "}
              {position.salaryMin != null || position.salaryMax != null ? (
                <span>
                  {position.salaryMin != null ? `$${position.salaryMin}` : "-"}{" "}
                  {" - "}
                  {position.salaryMax != null ? `$${position.salaryMax}` : "-"}
                </span>
              ) : (
                <span>-</span>
              )}
            </li>
            <li>
              <strong>Total Positions:</strong> {position.totalPositions || 0}
            </li>
          </ul>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium mb-2">Skills</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium">Required / Mandatory</h4>
            {skills.required.length === 0 ? (
              <div className="text-gray-500">No required skills listed.</div>
            ) : (
              <ul className="list-disc list-inside">
                {skills.required.map((s, i) => (
                  <li key={`req-${i}`}>{s}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="font-medium">Preferred</h4>
            {skills.preferred.length === 0 ? (
              <div className="text-gray-500">No preferred skills listed.</div>
            ) : (
              <ul className="list-disc list-inside">
                {skills.preferred.map((s, i) => (
                  <li key={`pref-${i}`}>{s}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Recent Applications</h3>
        {applications.length === 0 ? (
          <div className="text-gray-500">No applications yet.</div>
        ) : (
          <ul className="space-y-2">
            {applications.slice(0, 5).map((a) => (
              <li key={a.applicationId} className="border p-3 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">
                      {a.candidate?.firstName} {a.candidate?.lastName}
                    </div>
                    <div className="text-sm text-gray-600">{a.status}</div>
                  </div>
                  <span className="text-sm text-gray-500">
                    Application #{a.applicationId}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PositionDetails;
