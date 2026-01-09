import { useState, useEffect } from "react";
import {
  getEmployeeById,
  updateEmployee,
  relieveEmployee,
} from "../../services/employeeService";
import { format } from "date-fns";
import {
  getErrorMessage,
  showError,
  showSuccess,
} from "../../utils/toastUtils";

const EmployeeDetails = ({ employeeId }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [relieveModal, setRelieveModal] = useState(false);
  const [relieveData, setRelieveData] = useState({
    relievingDate: "",
    notes: "",
  });

  useEffect(() => {
    fetchEmployee();
  }, [employeeId]);

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const data = await getEmployeeById(employeeId);
      setEmployee(data);
      setEditData({
        designation: data.designation,
        department: data.department,
        salary: data.salary,
      });
    } catch (err) {
      console.error("Failed to fetch employee:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateEmployee(employeeId, editData);
      showSuccess("Employee updated successfully!");
      setEditing(false);
      await fetchEmployee();
    } catch (err) {
      showError(getErrorMessage(err, "Failed to update employee"));
    }
  };

  const handleRelieve = async () => {
    try {
      await relieveEmployee(
        employeeId,
        relieveData.relievingDate,
        relieveData.notes
      );
      showSuccess("Employee relieved successfully!");
      setRelieveModal(false);
      await fetchEmployee();
    } catch (err) {
      showError(getErrorMessage(err, "Failed to relieve employee"));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: "bg-green-100 text-green-800",
      ON_LEAVE: "bg-yellow-100 text-yellow-800",
      RESIGNED: "bg-orange-100 text-orange-800",
      TERMINATED: "bg-red-100 text-red-800",
      RETIRED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="text-center py-8">Loading employee details...</div>;
  }

  if (!employee) {
    return (
      <div className="text-center py-8 text-red-600">Employee not found</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {employee.candidateName}
            </h1>
            <p className="text-gray-600">{employee.candidateEmail}</p>
            <p className="font-mono text-lg mt-2">
              Employee Code:{" "}
              <span className="font-semibold">{employee.employeeCode}</span>
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
              employee.employmentStatus
            )}`}
          >
            {employee.employmentStatus}
          </span>
        </div>

        {!editing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600">Designation</p>
                <p className="font-semibold text-lg">{employee.designation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-semibold text-lg">{employee.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Annual Salary</p>
                <p className="font-semibold text-lg">
                  ₹{employee.salary?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Joining Date</p>
                <p className="font-semibold text-lg">
                  {employee.joiningDate
                    ? format(new Date(employee.joiningDate), "PPP")
                    : "N/A"}
                </p>
              </div>
              {employee.relievingDate && (
                <div>
                  <p className="text-sm text-gray-600">Relieving Date</p>
                  <p className="font-semibold text-lg">
                    {format(new Date(employee.relievingDate), "PPP")}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t pt-6 flex gap-3">
              {employee.employmentStatus === "ACTIVE" && (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => setRelieveModal(true)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    Relieve Employee
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation
              </label>
              <input
                type="text"
                value={editData.designation}
                onChange={(e) =>
                  setEditData({ ...editData, designation: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={editData.department}
                onChange={(e) =>
                  setEditData({ ...editData, department: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Salary
              </label>
              <input
                type="number"
                value={editData.salary}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    salary: parseFloat(e.target.value),
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Relieve Employee Modal */}
      {relieveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Relieve Employee</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relieving Date *
                </label>
                <input
                  type="date"
                  value={relieveData.relievingDate}
                  onChange={(e) =>
                    setRelieveData({
                      ...relieveData,
                      relievingDate: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={relieveData.notes}
                  onChange={(e) =>
                    setRelieveData({ ...relieveData, notes: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows="3"
                  placeholder="Reason for relieving (e.g., Resigned, Terminated)..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setRelieveModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRelieve}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Confirm Relieve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;
