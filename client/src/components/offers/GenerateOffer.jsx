import { useState } from "react";
import { generateOffer } from "../../services/offerService";
import { useParams } from "react-router-dom";
import {
  getErrorMessage,
  showError,
  showSuccess,
} from "../../utils/toastUtils";

const GenerateOffer = ({ candidateName, positionTitle, onComplete }) => {
  const [formData, setFormData] = useState({
    salaryOffered: "",
    offeredDesignation: "",
    joiningDate: "",
    offerValidTill: "",
    benefits: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { applicationId } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate applicationId
    if (!applicationId || applicationId === "undefined" || applicationId === "null") {
      setError("Invalid application ID");
      showError("Invalid application ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        salaryOffered: parseFloat(formData.salaryOffered),
        applicationId: parseInt(applicationId),
      };

      await generateOffer(payload);
      showSuccess("Offer generated successfully!");
      if (onComplete) onComplete();
    } catch (err) {
      const message = getErrorMessage(err, "Failed to generate offer");
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const getDefaultValidityDate = () => {
    const validity = new Date();
    validity.setDate(validity.getDate() + 15); // 15 days validity
    return validity.toISOString().split("T")[0];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Generate Offer Letter</h2>
      {candidateName && (
        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-medium">Candidate:</span> {candidateName}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Position:</span> {positionTitle}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Offered Designation *
            </label>
            <input
              type="text"
              value={formData.offeredDesignation}
              onChange={(e) =>
                setFormData({ ...formData, offeredDesignation: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., Senior Software Engineer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Salary (₹) *
            </label>
            <input
              type="number"
              value={formData.salaryOffered}
              onChange={(e) =>
                setFormData({ ...formData, salaryOffered: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., 1200000"
              min="0"
              step="1000"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joining Date *
              </label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) =>
                  setFormData({ ...formData, joiningDate: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min={getTomorrowDate()}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Offer Valid Till *
              </label>
              <input
                type="date"
                value={formData.offerValidTill}
                onChange={(e) =>
                  setFormData({ ...formData, offerValidTill: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min={new Date().toISOString().split("T")[0]}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Typically 7-15 days from today
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Benefits & Perks
            </label>
            <textarea
              value={formData.benefits}
              onChange={(e) =>
                setFormData({ ...formData, benefits: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows="4"
              placeholder="e.g., Health Insurance, Work from Home, Flexible Hours, Performance Bonus..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onComplete}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Generating..." : "Generate Offer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GenerateOffer;
