import React, { useState } from "react";
import { createPosition } from "../../services/positionService";
import { useNavigate } from "react-router-dom";

const AddPosition = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [employmentType, setEmploymentType] = useState("FULL_TIME");
  const [experienceMin, setExperienceMin] = useState(0);
  const [experienceMax, setExperienceMax] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        jobTitle,
        jobDescription,
        department,
        employmentType,
        experienceRequiredMin: Number(experienceMin) || 0,
        experienceRequiredMax: Number(experienceMax) || 0,
      };
      const created = await createPosition(payload);
      navigate(`/positions/${created.positionId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-6 mt-20">
      <h2 className="text-2xl font-bold mb-4">Add Position</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label className="block font-medium">Job Title</label>
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full border p-2 rounded"
            rows={6}
          />
        </div>
        <div>
          <label className="block font-medium">Department</label>
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Employment Type</label>
          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Experience Min (yrs)</label>
            <input
              type="number"
              value={experienceMin}
              onChange={(e) => setExperienceMin(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Experience Max (yrs)</label>
            <input
              type="number"
              value={experienceMax}
              onChange={(e) => setExperienceMax(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>
        <div>
          <button className="px-4 py-2 rounded bg-[var(--primary-color)] text-white">
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPosition;
