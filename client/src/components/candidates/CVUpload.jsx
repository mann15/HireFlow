import React, { useState, useEffect } from "react";
import axios from "axios";
import { candidateService } from "../../services/candidateService";
import SearchableDropdown from "../SearchableDropdown";

const CVUpload = ({ candidateId, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [positionId, setPositionId] = useState("");
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [parsedCandidate, setParsedCandidate] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type === "application/msword" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Please select a valid file (PDF, DOC, or DOCX)");
        setFile(null);
      }
    }
  };

  useEffect(() => {
    // fetch available positions for optional selection
    let mounted = true;
    axios
      .get("/api/positions")
      .then((res) => {
        if (mounted && Array.isArray(res.data)) setPositions(res.data);
      })
      .catch((err) => {
        // ignore - positions optional
        console.debug("Failed to fetch positions", err?.message || err);
      });
    return () => (mounted = false);
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let result;
      if (candidateId) {
        result = await candidateService.uploadCV(
          candidateId,
          positionId || null,
          file
        );
      } else {
        // create candidate from CV
        result = await candidateService.createCandidateFromCV(
          positionId || null,
          file
        );
      }

      // result may contain { cv, candidate }
      console.log("CV upload result:", result);
      setSuccess("CV uploaded successfully");
      setFile(null);
      setPositionId("");

      // Backend returns either { cv, candidate } for uploadCV or { candidate, cv, application } for createCandidateFromCV
      if (result) {
        if (result.candidate) setParsedCandidate(result.candidate);
        else if (result.cv && result.cv.candidate)
          setParsedCandidate(result.cv.candidate);
        else setParsedCandidate(null);
      }

      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (err) {
      setError(err.error || "Failed to upload CV");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCandidate = async () => {
    if (!parsedCandidate) return;
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (parsedCandidate.candidateId) {
        // existing candidate - update
        await candidateService.updateCandidate(
          parsedCandidate.candidateId,
          parsedCandidate
        );
        setSuccess("Candidate updated successfully");
      } else {
        const created = await candidateService.createCandidate(parsedCandidate);
        setParsedCandidate(created);
        setSuccess("Candidate created successfully");
      }
    } catch (e) {
      setError(e.error || "Failed to save candidate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload CV</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select CV File
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <SearchableDropdown
          label="Position (optional)"
          value={positionId}
          onChange={setPositionId}
          options={[
            { value: "", label: "No position (create candidate only)" },
            ...positions.map((p) => ({
              value: p.positionId || p.id,
              label: `${p.jobTitle} (#${p.positionId || p.id})`,
              subtitle: `${p.department} • ${p.status || "OPEN"}`,
            })),
          ]}
          placeholder="Select a position"
          loading={loading && positions.length === 0}
          noOptionsText="No positions available"
        />

        {file && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">Selected file: {file.name}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {parsedCandidate && (
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-md p-4">
            <h3 className="text-md font-medium mb-2">Parsed Candidate</h3>
            <div className="grid grid-cols-1 gap-2">
              <input
                value={parsedCandidate.firstName || ""}
                onChange={(e) =>
                  setParsedCandidate({
                    ...parsedCandidate,
                    firstName: e.target.value,
                  })
                }
                className="px-2 py-1 border rounded"
                placeholder="First name"
              />
              <input
                value={parsedCandidate.lastName || ""}
                onChange={(e) =>
                  setParsedCandidate({
                    ...parsedCandidate,
                    lastName: e.target.value,
                  })
                }
                className="px-2 py-1 border rounded"
                placeholder="Last name"
              />
              <input
                value={parsedCandidate.email || ""}
                onChange={(e) =>
                  setParsedCandidate({
                    ...parsedCandidate,
                    email: e.target.value,
                  })
                }
                className="px-2 py-1 border rounded"
                placeholder="Email"
              />
              <input
                value={parsedCandidate.phone || ""}
                onChange={(e) =>
                  setParsedCandidate({
                    ...parsedCandidate,
                    phone: e.target.value,
                  })
                }
                className="px-2 py-1 border rounded"
                placeholder="Phone"
              />
              <input
                value={parsedCandidate.currentLocation || ""}
                onChange={(e) =>
                  setParsedCandidate({
                    ...parsedCandidate,
                    currentLocation: e.target.value,
                  })
                }
                className="px-2 py-1 border rounded"
                placeholder="Current location"
              />
              <input
                value={parsedCandidate.preferredLocation || ""}
                onChange={(e) =>
                  setParsedCandidate({
                    ...parsedCandidate,
                    preferredLocation: e.target.value,
                  })
                }
                className="px-2 py-1 border rounded"
                placeholder="Preferred location"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleSaveCandidate}
                className="bg-green-600 text-white px-3 py-2 rounded"
              >
                Save Candidate
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload CV"}
        </button>

        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">Supported formats:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>PDF (.pdf)</li>
            <li>Microsoft Word (.doc)</li>
            <li>Microsoft Word (.docx)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CVUpload;
