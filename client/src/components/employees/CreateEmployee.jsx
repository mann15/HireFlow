import { useState, useEffect } from "react";
import { createEmployee } from "../../services/employeeService";
import { getPositions } from "../../services/positionService";
import SearchableDropdown from "../SearchableDropdown";
import {
  getErrorMessage,
  showError,
  showSuccess,
} from "../../utils/toastUtils";

const CreateEmployee = ({
  candidateId,
  applicationId,
  offerId,
  candidateName,
  onComplete,
}) => {
  const [formData, setFormData] = useState({
    candidateId: candidateId,
    positionId: "",
    offerId: offerId || "",
    designation: "",
    department: "",
    joiningDate: "",
    salary: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [positions, setPositions] = useState([]);
  const [loadingPositions, setLoadingPositions] = useState(false);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setLoadingPositions(true);
      const data = await getPositions();
      setPositions(data || []);
    } catch (err) {
      console.error("Failed to load positions", err);
    } finally {
      setLoadingPositions(false);
    }
  };

  const departments = [
    "Engineering",
    "Product",
    "Design",
    "Marketing",
    "Sales",
    "HR",
    "Finance",
    "Operations",
    "Customer Support",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        positionId: parseInt(formData.positionId),
        offerId: formData.offerId ? parseInt(formData.offerId) : null,
        salary: parseFloat(formData.salary),
      };

      const response = await createEmployee(payload);
      showSuccess(
        `Employee created successfully! Employee Code: ${
          response.employeeCode || "Generated"
        }`
      );
      if (onComplete) onComplete();
    } catch (err) {
      const message = getErrorMessage(err, "Failed to create employee record");
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Create Employee Record</h2>
      {candidateName && (
        <p className="text-gray-600 mb-6">
          Creating employee record for:{" "}
          <span className="font-semibold">{candidateName}</span>
        </p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableDropdown
              label="Position"
              value={formData.positionId}
              onChange={(value) =>
                setFormData({ ...formData, positionId: value })
              }
              options={positions.map((pos) => ({
                value: pos.positionId || pos.id,
                label: `${pos.jobTitle} (#${pos.positionId || pos.id})`,
                subtitle: `${pos.department} • ${pos.status || "OPEN"}`,
              }))}
              placeholder="Select a position"
              loading={loadingPositions}
              required
              noOptionsText="No positions found"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Offer ID (Optional)
              </label>
              <input
                type="number"
                value={formData.offerId}
                onChange={(e) =>
                  setFormData({ ...formData, offerId: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Offer ID if available"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation *
            </label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) =>
                setFormData({ ...formData, designation: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., Senior Software Engineer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department *
            </label>
            <select
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
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
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Salary (₹) *
              </label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) =>
                  setFormData({ ...formData, salary: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g., 1200000"
                min="0"
                step="1000"
                required
              />
            </div>
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
            {loading ? "Creating..." : "Create Employee"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEmployee;
