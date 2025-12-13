import { useState, useEffect } from "react";
import {
  getAllEmployees,
  getEmployeesByStatus,
  getEmployeesByDepartment,
} from "../../services/employeeService";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");
  const [filterValue, setFilterValue] = useState("");

  const statuses = ["ACTIVE", "ON_LEAVE", "RESIGNED", "TERMINATED", "RETIRED"];
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

  useEffect(() => {
    fetchEmployees();
  }, [filterType, filterValue]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      let data;
      if (filterType === "STATUS" && filterValue) {
        data = await getEmployeesByStatus(filterValue);
      } else if (filterType === "DEPARTMENT" && filterValue) {
        data = await getEmployeesByDepartment(filterValue);
      } else {
        data = await getAllEmployees();
      }
      setEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setEmployees([]);
    } finally {
      setLoading(false);
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
    return <div className="text-center py-8">Loading employees...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Employee Directory</h1>
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
              {employees.length} Employees
            </span>
          </div>

          <div className="flex gap-4">
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterValue("");
              }}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="ALL">All Employees</option>
              <option value="STATUS">Filter by Status</option>
              <option value="DEPARTMENT">Filter by Department</option>
            </select>

            {filterType === "STATUS" && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            )}

            {filterType === "DEPARTMENT" && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {employees.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No employees found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Joining Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium">
                        {emp.employeeCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{emp.candidateName}</p>
                        <p className="text-sm text-gray-500">
                          {emp.candidateEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{emp.designation}</td>
                    <td className="px-6 py-4">{emp.department}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          emp.employmentStatus
                        )}`}
                      >
                        {emp.employmentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {emp.joiningDate
                        ? format(new Date(emp.joiningDate), "PP")
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/employees/${emp.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDirectory;
