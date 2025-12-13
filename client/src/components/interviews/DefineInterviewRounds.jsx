import { useState, useEffect } from "react";
import { defineInterviewRounds } from "../../services/interviewService";

const DefineInterviewRounds = ({ positionId, onComplete }) => {
  const [rounds, setRounds] = useState([
    {
      roundName: "",
      roundType: "TECHNICAL",
      roundOrder: 1,
      durationMinutes: 60,
      isMandatory: true,
      description: "",
    },
  ]);
  const [scope, setScope] = useState("POSITION_DEFAULT");
  const [candidateId, setCandidateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const roundTypes = [
    "TECHNICAL",
    "HR",
    "MANAGERIAL",
    "PANEL",
    "BEHAVIORAL",
    "CODING",
    "ONLINE_TEST",
  ];

  const templates = {
    techHr: [
      {
        roundName: "Technical Round",
        roundType: "TECHNICAL",
        roundOrder: 1,
        durationMinutes: 60,
        isMandatory: true,
        description: "Core technical depth evaluation.",
      },
      {
        roundName: "HR & Culture Fit",
        roundType: "HR",
        roundOrder: 2,
        durationMinutes: 45,
        isMandatory: true,
        description: "Soft skills, culture fit, and compensation discussion.",
      },
    ],
    techPanelHr: [
      {
        roundName: "Technical Panel",
        roundType: "PANEL",
        roundOrder: 1,
        durationMinutes: 75,
        isMandatory: true,
        description: "Panel-based technical + systems evaluation.",
      },
      {
        roundName: "HR Round",
        roundType: "HR",
        roundOrder: 2,
        durationMinutes: 40,
        isMandatory: true,
        description: "HR and final negotiation.",
      },
    ],
  };

  const addRound = () => {
    setRounds([
      ...rounds,
      {
        roundName: "",
        roundType: "TECHNICAL",
        roundOrder: rounds.length + 1,
        durationMinutes: 60,
        isMandatory: true,
        description: "",
      },
    ]);
  };

  const removeRound = (index) => {
    const newRounds = rounds.filter((_, i) => i !== index);
    // Update round orders
    newRounds.forEach((round, i) => {
      round.roundOrder = i + 1;
    });
    setRounds(newRounds);
  };

  const updateRound = (index, field, value) => {
    const newRounds = [...rounds];
    newRounds[index][field] = value;
    setRounds(newRounds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (scope === "CANDIDATE_SPECIFIC" && !candidateId) {
      setError("Candidate ID is required for candidate-specific overrides.");
      setLoading(false);
      return;
    }

    try {
      await defineInterviewRounds(
        positionId,
        rounds,
        scope === "CANDIDATE_SPECIFIC" ? candidateId : undefined
      );
      setSuccess(
        scope === "CANDIDATE_SPECIFIC"
          ? "Candidate-specific interview rounds saved."
          : "Default interview rounds for this position saved."
      );
      alert("Interview rounds defined successfully!");
      if (onComplete) onComplete();
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to define interview rounds"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Define Interview Rounds</h2>

      <p className="text-gray-600 mb-4 text-sm">
        Create the default round plan for a position or override it for a
        specific candidate (e.g., senior profiles needing extra steps).
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="radio"
              name="scope"
              value="POSITION_DEFAULT"
              checked={scope === "POSITION_DEFAULT"}
              onChange={() => setScope("POSITION_DEFAULT")}
            />
            Position default
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="radio"
              name="scope"
              value="CANDIDATE_SPECIFIC"
              checked={scope === "CANDIDATE_SPECIFIC"}
              onChange={() => setScope("CANDIDATE_SPECIFIC")}
            />
            Candidate-specific override
          </label>
        </div>

        {scope === "CANDIDATE_SPECIFIC" && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Candidate ID</label>
            <input
              type="number"
              min="1"
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              className="w-40 border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., 1024"
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          type="button"
          onClick={() =>
            setRounds(JSON.parse(JSON.stringify(templates.techHr)))
          }
          className="px-3 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-sm"
        >
          Use Tech + HR template
        </button>
        <button
          type="button"
          onClick={() =>
            setRounds(JSON.parse(JSON.stringify(templates.techPanelHr)))
          }
          className="px-3 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 text-sm"
        >
          Use Panel + HR template
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {rounds.map((round, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Round {round.roundOrder}
                </h3>
                {rounds.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRound(index)}
                    className="text-red-600 hover:text-red-800"
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
                      updateRound(index, "roundName", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Technical Round 1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Round Type *
                  </label>
                  <select
                    value={round.roundType}
                    onChange={(e) =>
                      updateRound(index, "roundType", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    {roundTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={round.durationMinutes}
                    onChange={(e) =>
                      updateRound(
                        index,
                        "durationMinutes",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    min="15"
                    step="15"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={round.isMandatory}
                    onChange={(e) =>
                      updateRound(index, "isMandatory", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 rounded"
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
                      updateRound(index, "description", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="2"
                    placeholder="Describe what this round will cover..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between">
          <button
            type="button"
            onClick={addRound}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
          >
            + Add Another Round
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Saving..." : "Define Rounds"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DefineInterviewRounds;
