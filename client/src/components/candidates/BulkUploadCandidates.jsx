import React, { useState } from "react";
import { candidateService } from "../../services/candidateService";
import * as XLSX from "xlsx";

const BulkUploadCandidates = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel"
      ) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Please select a valid Excel file (.xlsx or .xls)");
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Parse Excel file and convert to JSON
      const candidateData = await parseExcelFile(file);

      // Upload candidates
      const result = await candidateService.bulkUploadCandidates(candidateData);

      setSuccess(
        `Successfully uploaded ${result.candidates.length} candidates`
      );
      setFile(null);

      if (onUploadComplete) {
        onUploadComplete(result.candidates);
      }
    } catch (err) {
      setError(err.error || "Failed to upload candidates");
    } finally {
      setLoading(false);
    }
  };

  const parseExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          // Use the first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to JSON
          const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: null });

          // Map/normalize each row to expected fields and types
          const mapped = rawJson.map((row) => {
            const safe = (k) =>
              row[k] !== undefined && row[k] !== null ? row[k] : null;

            // Normalize numeric fields if they are strings
            const totalExperience = safe("totalExperience");
            const currentSalary = safe("currentSalary");
            const expectedSalary = safe("expectedSalary");
            const noticePeriod = safe("noticePeriod");

            return {
              firstName:
                safe("firstName") ||
                safe("First Name") ||
                safe("first_name") ||
                "",
              lastName:
                safe("lastName") ||
                safe("Last Name") ||
                safe("last_name") ||
                "",
              email: safe("email") || safe("Email") || "",
              phone: safe("phone") || safe("Phone") || null,
              currentLocation:
                safe("currentLocation") || safe("Current Location") || null,
              preferredLocation:
                safe("preferredLocation") || safe("Preferred Location") || null,
              totalExperience:
                totalExperience !== null && totalExperience !== ""
                  ? parseFloat(totalExperience)
                  : 0,
              currentSalary:
                currentSalary !== null && currentSalary !== ""
                  ? parseFloat(currentSalary)
                  : null,
              expectedSalary:
                expectedSalary !== null && expectedSalary !== ""
                  ? parseFloat(expectedSalary)
                  : null,
              noticePeriod:
                noticePeriod !== null && noticePeriod !== ""
                  ? parseInt(noticePeriod)
                  : null,
              source: safe("source") || "OTHER",
              sourceDetails: safe("sourceDetails") || null,
              linkedinUrl: safe("linkedinUrl") || null,
              githubUrl: safe("githubUrl") || null,
              portfolioUrl: safe("portfolioUrl") || null,
            };
          });

          resolve(mapped);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = (e) => {
        reject(e);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const downloadTemplate = () => {
    // Create a sample Excel template
    const templateData = [
      [
        "firstName",
        "lastName",
        "email",
        "phone",
        "currentLocation",
        "preferredLocation",
        "totalExperience",
        "currentSalary",
        "expectedSalary",
        "noticePeriod",
        "source",
        "sourceDetails",
        "linkedinUrl",
        "githubUrl",
        "portfolioUrl",
      ],
      [
        "John",
        "Doe",
        "john.doe@example.com",
        "+1234567890",
        "New York",
        "San Francisco",
        "5",
        "80000",
        "100000",
        "30",
        "JOB_PORTAL",
        "LinkedIn",
        "https://linkedin.com/in/johndoe",
        "https://github.com/johndoe",
        "https://johndoe.com",
      ],
    ];

    // Convert to CSV and download
    const csvContent = templateData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "candidate_template.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Bulk Upload Candidates
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Excel File
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

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

        <div className="flex gap-4">
          <button
            onClick={downloadTemplate}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200"
          >
            Download Template
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Candidates"}
          </button>
        </div>

        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">Instructions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Download the template file to see the required format</li>
            <li>Fill in candidate information in the Excel file</li>
            <li>Upload the completed file</li>
            <li>Required fields: firstName, lastName, email</li>
            <li>
              Source options: JOB_PORTAL, REFERRAL, WALK_IN, CAMPUS,
              SOCIAL_MEDIA, COMPANY_WEBSITE, OTHER
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadCandidates;
