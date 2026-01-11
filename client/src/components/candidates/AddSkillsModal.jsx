import React, { useState, useEffect } from "react";
import { skillService } from "../../services/apiService";
import { candidateService } from "../../services/candidateService";
import {
  getErrorMessage,
  showError,
  showSuccess,
} from "../../utils/toastUtils";
import { FiX, FiPlus, FiCheck } from "react-icons/fi";

const AddSkillsModal = ({ candidateId, isOpen, onClose, onSkillAdded }) => {
  const [skills, setSkills] = useState([]);
  const [proficiencyLevels, setProficiencyLevels] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedSkillName, setSelectedSkillName] = useState("");
  const [selectedProficiency, setSelectedProficiency] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomSkill, setShowCustomSkill] = useState(false);
  const [customSkillName, setCustomSkillName] = useState("");
  const [creatingSkill, setCreatingSkill] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSkillsAndProficiencies();
    }
  }, [isOpen]);

  const loadSkillsAndProficiencies = async () => {
    try {
      setLoading(true);
      const [skillsData, profData] = await Promise.all([
        skillService.getSkills(),
        getProficiencyLevels(),
      ]);

      const skillsArray = Array.isArray(skillsData)
        ? skillsData
        : skillsData?.skills || skillsData?.data || [];

      const profArray = Array.isArray(profData)
        ? profData
        : profData?.data || [];

      setSkills(skillsArray);
      setProficiencyLevels(profArray);

      console.log("Loaded skills:", skillsArray.length);
      console.log("Loaded proficiency levels:", profArray.length);
    } catch (err) {
      console.error("Error loading skills:", err);
      showError(getErrorMessage(err, "Failed to load skills"));
    } finally {
      setLoading(false);
    }
  };

  const getProficiencyLevels = async () => {
    try {
      const response = await fetch("/api/proficiency-levels");
      if (!response.ok) {
        // Fallback to default levels
        return [
          { id: 1, levelName: "Beginner" },
          { id: 2, levelName: "Intermediate" },
          { id: 3, levelName: "Advanced" },
          { id: 4, levelName: "Expert" },
        ];
      }
      return await response.json();
    } catch (err) {
      // Fallback to default levels
      return [
        { id: 1, levelName: "Beginner" },
        { id: 2, levelName: "Intermediate" },
        { id: 3, levelName: "Advanced" },
        { id: 4, levelName: "Expert" },
      ];
    }
  };

  const handleSelectSkill = (skill) => {
    setSelectedSkill(skill.skillId || skill.id);
    setSelectedSkillName(skill.skillName || skill.name);
    setSearchTerm("");
    setShowDropdown(false);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setShowDropdown(value.length > 0);
    // Reset selection when user types a new search
    if (value && !selectedSkillName) {
      setSelectedSkill("");
    }
  };

  const filteredSkills =
    searchTerm.length > 0
      ? skills
          .filter((skill) =>
            (skill.skillName || skill.name || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
          .slice(0, 8) // Limit to 8 suggestions
      : [];

  const handleAddSkill = async (e) => {
    e.preventDefault();

    if (!selectedSkill || !selectedProficiency) {
      showError("Please select both a skill and proficiency level");
      return;
    }

    try {
      setSaving(true);
      console.log("Adding skill:", {
        selectedSkill,
        selectedProficiency,
        yearsOfExperience,
        candidateId,
      });

      await candidateService.addCandidateSkill(
        candidateId,
        selectedSkill,
        selectedProficiency,
        yearsOfExperience ? parseFloat(yearsOfExperience) : null
      );
      showSuccess("Skill added successfully");

      // Reset form
      setSelectedSkill("");
      setSelectedSkillName("");
      setSelectedProficiency("");
      setYearsOfExperience("");
      setSearchTerm("");
      setShowCustomSkill(false);
      setCustomSkillName("");
      setShowDropdown(false);

      // Notify parent component
      if (onSkillAdded) {
        console.log("Calling onSkillAdded callback");
        onSkillAdded();
      }
    } catch (err) {
      console.error("Error adding skill:", err);
      showError(getErrorMessage(err, "Failed to add skill"));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCustomSkill = async (e) => {
    e.preventDefault();

    if (!customSkillName.trim()) {
      showError("Please enter a skill name");
      return;
    }

    if (!selectedProficiency) {
      showError("Please select a proficiency level");
      return;
    }

    try {
      setCreatingSkill(true);

      // Create new skill
      const newSkill = await skillService.createSkill({
        skillName: customSkillName.trim(),
        category: "Custom",
      });

      if (!newSkill || !newSkill.skillId) {
        throw new Error("Failed to create skill");
      }

      // Add skill to candidate
      await candidateService.addCandidateSkill(
        candidateId,
        newSkill.skillId,
        selectedProficiency,
        yearsOfExperience ? parseFloat(yearsOfExperience) : null
      );

      showSuccess(`Skill "${customSkillName}" created and added successfully`);

      // Reset form
      setSelectedSkill("");
      setSelectedProficiency("");
      setYearsOfExperience("");
      setSearchTerm("");
      setShowCustomSkill(false);
      setCustomSkillName("");

      // Reload skills list
      await loadSkillsAndProficiencies();

      // Notify parent component
      if (onSkillAdded) {
        onSkillAdded();
      }
    } catch (err) {
      console.error("Error creating skill:", err);
      console.error("Error details:", {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
      });
      showError(getErrorMessage(err, "Failed to create custom skill"));
    } finally {
      setCreatingSkill(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Skills</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleAddSkill} className="p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {/* Toggle between existing and custom skill */}
              <div className="flex gap-2 mb-4 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomSkill(false);
                    setCustomSkillName("");
                    setSelectedSkill("");
                  }}
                  className={`px-4 py-2 font-medium border-b-2 transition ${
                    !showCustomSkill
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  From Database
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomSkill(true);
                    setSelectedSkill("");
                    setSearchTerm("");
                  }}
                  className={`px-4 py-2 font-medium border-b-2 transition ${
                    showCustomSkill
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Create Custom Skill
                </button>
              </div>

              {!showCustomSkill ? (
                <>
                  {/* Skill Selection from Database - Autocomplete Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search & Select Skill
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Type to search skills..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onFocus={() => setShowDropdown(true)}
                        className={`w-full px-3 py-2 border-2 rounded-md transition ${
                          selectedSkill
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        } focus:outline-none`}
                      />

                      {/* Selected Skill Display */}
                      {selectedSkill && selectedSkillName && (
                        <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
                          <FiCheck className="text-green-600" />
                          <span className="text-sm text-gray-700">
                            {selectedSkillName}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSkill("");
                              setSelectedSkillName("");
                              setSearchTerm("");
                            }}
                            className="ml-auto text-gray-400 hover:text-gray-600"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      )}

                      {/* Dropdown Suggestions */}
                      {showDropdown && searchTerm && !selectedSkill && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-64 overflow-y-auto">
                          {filteredSkills.length > 0 ? (
                            filteredSkills.map((skill) => (
                              <button
                                key={skill.skillId || skill.id}
                                type="button"
                                onClick={() => handleSelectSkill(skill)}
                                className="w-full text-left px-3 py-2 hover:bg-indigo-50 border-b border-gray-200 last:border-b-0 transition flex items-center gap-2"
                              >
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {skill.skillName || skill.name}
                                  </div>
                                  {skill.category && (
                                    <div className="text-xs text-gray-500">
                                      {skill.category}
                                    </div>
                                  )}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No skills found. Create a custom skill instead.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Custom Skill Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Skill Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter skill name (e.g., Advanced Excel, Leadership)"
                      value={customSkillName}
                      onChange={(e) => setCustomSkillName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </>
              )}

              {/* Proficiency Level (Always shown) */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proficiency Level
                </label>
                <select
                  value={selectedProficiency}
                  onChange={(e) => setSelectedProficiency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select proficiency level</option>
                  {proficiencyLevels.map((level) => (
                    <option
                      key={level.id || level.levelId}
                      value={level.id || level.levelId}
                    >
                      {level.levelName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Years of Experience (Optional) */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0"
                />
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="flex gap-3 justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={saving || creatingSkill}
          >
            Cancel
          </button>
          <button
            onClick={showCustomSkill ? handleCreateCustomSkill : handleAddSkill}
            disabled={
              saving ||
              creatingSkill ||
              loading ||
              !selectedProficiency ||
              (!showCustomSkill && !selectedSkill) ||
              (showCustomSkill && !customSkillName.trim())
            }
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {creatingSkill || saving ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
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
                {showCustomSkill ? "Creating..." : "Adding..."}
              </>
            ) : (
              <>
                <FiPlus size={18} />
                {showCustomSkill ? "Create & Add Skill" : "Add Skill"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSkillsModal;
