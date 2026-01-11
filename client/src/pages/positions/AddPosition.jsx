import React, { useState } from "react";
import {
  createPosition,
  addPositionSkills,
} from "../../services/positionService";
import { defineInterviewRounds } from "../../services/interviewService";
import { useNavigate } from "react-router-dom";

const AddPosition = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [employmentType, setEmploymentType] = useState("FULL_TIME");
  const [experienceMin, setExperienceMin] = useState(0);
  const [experienceMax, setExperienceMax] = useState(0);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [totalPositions, setTotalPositions] = useState(1);
  const [requiredSkills, setRequiredSkills] = useState([""]);
  const [preferredSkills, setPreferredSkills] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [defineRoundsNow, setDefineRoundsNow] = useState(false);
  const [interviewRounds, setInterviewRounds] = useState([
    {
      roundName: "",
      roundType: "TECHNICAL",
      roundOrder: 1,
      durationMinutes: 60,
      isMandatory: true,
      description: "",
    },
  ]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!jobTitle.trim() || !jobDescription.trim() || !department.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (
      salaryMin &&
      salaryMax &&
      parseFloat(salaryMin) > parseFloat(salaryMax)
    ) {
      setError("Minimum salary cannot be greater than maximum salary");
      return;
    }

    if (experienceMin > experienceMax) {
      setError("Minimum experience cannot be greater than maximum experience");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        jobTitle: jobTitle.trim(),
        jobDescription: jobDescription.trim(),
        department: department.trim(),
        employmentType,
        experienceRequiredMin: Number(experienceMin) || 0,
        experienceRequiredMax: Number(experienceMax) || 0,
        salaryMin: salaryMin ? parseFloat(salaryMin) : null,
        salaryMax: salaryMax ? parseFloat(salaryMax) : null,
        totalPositions: Number(totalPositions) || 1,
      };

      const created = await createPosition(payload);

      // Process skills
      const reqSkillsClean = requiredSkills
        .map((s) => s.trim())
        .filter(Boolean);
      const prefSkillsClean = preferredSkills
        .map((s) => s.trim())
        .filter(Boolean);

      if (reqSkillsClean.length > 0 || prefSkillsClean.length > 0) {
        try {
          await addPositionSkills(created.positionId, {
            required: reqSkillsClean,
            preferred: prefSkillsClean,
          });
        } catch (skillErr) {
          console.error("Failed to add skills", skillErr);
        }
      }

      // Define interview rounds if user chose to do so
      if (defineRoundsNow && interviewRounds.length > 0) {
        const validRounds = interviewRounds.filter(
          (r) => r.roundName && r.roundName.trim()
        );
        if (validRounds.length > 0) {
          try {
            await defineInterviewRounds(created.positionId, validRounds);
          } catch (roundErr) {
            console.error("Failed to define interview rounds", roundErr);
            // Don't block navigation, just log the error
          }
        }
      }

      navigate(`/positions/${created.positionId}`);
    } catch (err) {
      setError(err.message || "Failed to create position");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addRequiredSkill = () => {
    setRequiredSkills([...requiredSkills, ""]);
  };

  const removeRequiredSkill = (index) => {
    if (requiredSkills.length > 1) {
      setRequiredSkills(requiredSkills.filter((_, i) => i !== index));
    }
  };

  const updateRequiredSkill = (index, value) => {
    const updatedSkills = [...requiredSkills];
    updatedSkills[index] = value;
    setRequiredSkills(updatedSkills);
  };

  const addPreferredSkill = () => {
    setPreferredSkills([...preferredSkills, ""]);
  };

  const removePreferredSkill = (index) => {
    if (preferredSkills.length > 1) {
      setPreferredSkills(preferredSkills.filter((_, i) => i !== index));
    }
  };

  const updatePreferredSkill = (index, value) => {
    const updatedSkills = [...preferredSkills];
    updatedSkills[index] = value;
    setPreferredSkills(updatedSkills);
  };

  const addInterviewRound = () => {
    setInterviewRounds([
      ...interviewRounds,
      {
        roundName: "",
        roundType: "TECHNICAL",
        roundOrder: interviewRounds.length + 1,
        durationMinutes: 60,
        isMandatory: true,
        description: "",
      },
    ]);
  };

  const removeInterviewRound = (index) => {
    const newRounds = interviewRounds.filter((_, i) => i !== index);
    newRounds.forEach((round, i) => {
      round.roundOrder = i + 1;
    });
    setInterviewRounds(newRounds);
  };

  const updateInterviewRound = (index, field, value) => {
    const newRounds = [...interviewRounds];
    newRounds[index][field] = value;
    setInterviewRounds(newRounds);
  };

  return (
    <div className="container mx-auto p-6 mt-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Position
          </h2>
          <p className="text-gray-600">
            Fill in the details below to create a new job position
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-sm rounded-lg p-8 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Senior Software Engineer"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={6}
                placeholder="Describe the role, responsibilities, and requirements..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Engineering, Marketing, Sales"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Experience (years)
              </label>
              <input
                type="number"
                min="0"
                value={experienceMin}
                onChange={(e) => setExperienceMin(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Experience (years)
              </label>
              <input
                type="number"
                min="0"
                value={experienceMax}
                onChange={(e) => setExperienceMax(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Salary
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm pl-8 pr-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="50000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Salary
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm pl-8 pr-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="80000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Positions
              </label>
              <input
                type="number"
                min="1"
                value={totalPositions}
                onChange={(e) => setTotalPositions(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="1"
              />
            </div>
          </div>

          {/* Skills Section - Now properly integrated in the form */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Skills</h3>

            {/* Required Skills */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Required Skills
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Enter skill names required for this position.
              </p>
              {requiredSkills.map((skill, index) => (
                <div
                  key={`req-${index}`}
                  className="flex items-center gap-3 mb-3"
                >
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateRequiredSkill(index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Java, Python, Project Management"
                  />
                  <button
                    type="button"
                    onClick={() => removeRequiredSkill(index)}
                    disabled={requiredSkills.length === 1}
                    className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                      requiredSkills.length === 1
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-red-700 bg-white hover:bg-red-50"
                    }`}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addRequiredSkill}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Required Skill
              </button>
            </div>

            {/* Preferred Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Skills
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Enter skill names that are preferred (not mandatory).
              </p>
              {preferredSkills.map((skill, index) => (
                <div
                  key={`pref-${index}`}
                  className="flex items-center gap-3 mb-3"
                >
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) =>
                      updatePreferredSkill(index, e.target.value)
                    }
                    className="flex-1 border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., React, AWS, Agile Certification"
                  />
                  <button
                    type="button"
                    onClick={() => removePreferredSkill(index)}
                    disabled={preferredSkills.length === 1}
                    className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                      preferredSkills.length === 1
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-red-700 bg-white hover:bg-red-50"
                    }`}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPreferredSkill}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Preferred Skill
              </button>
            </div>
          </div>

          {/* Interview Rounds Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={defineRoundsNow}
                  onChange={(e) => setDefineRoundsNow(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                Define Interview Rounds Now
              </label>
              <p className="text-sm text-gray-500 mt-1 ml-6">
                You can define interview rounds now or later from the position details page.
              </p>
            </div>

            {defineRoundsNow && (
              <div className="ml-6 space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Interview Rounds Configuration
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Define the number and type of interview rounds for this position.
                </p>

                {interviewRounds.map((round, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-semibold">
                        Round {round.roundOrder}
                      </h4>
                      {interviewRounds.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInterviewRound(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Round Name *
                        </label>
                        <input
                          type="text"
                          value={round.roundName}
                          onChange={(e) =>
                            updateInterviewRound(
                              index,
                              "roundName",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., Technical Round 1"
                          required={defineRoundsNow}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Round Type *
                        </label>
                        <select
                          value={round.roundType}
                          onChange={(e) =>
                            updateInterviewRound(
                              index,
                              "roundType",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required={defineRoundsNow}
                        >
                          <option value="TECHNICAL">Technical</option>
                          <option value="HR">HR</option>
                          <option value="MANAGERIAL">Managerial</option>
                          <option value="PANEL">Panel</option>
                          <option value="BEHAVIORAL">Behavioral</option>
                          <option value="CODING">Coding</option>
                          <option value="ONLINE_TEST">Online Test</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (minutes) *
                        </label>
                        <input
                          type="number"
                          min="15"
                          step="15"
                          value={round.durationMinutes}
                          onChange={(e) =>
                            updateInterviewRound(
                              index,
                              "durationMinutes",
                              parseInt(e.target.value) || 60
                            )
                          }
                          className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required={defineRoundsNow}
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={round.isMandatory}
                          onChange={(e) =>
                            updateInterviewRound(
                              index,
                              "isMandatory",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          Mandatory Round
                        </label>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={round.description}
                          onChange={(e) =>
                            updateInterviewRound(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                          rows="2"
                          placeholder="Describe what this round will cover..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addInterviewRound}
                  className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 text-sm font-medium"
                >
                  + Add Another Round
                </button>
              </div>
            )}
          </div>

          <div className="pt-6 flex justify-end space-x-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/positions")}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Position"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPosition;
