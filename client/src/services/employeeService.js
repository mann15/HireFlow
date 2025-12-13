import api from "../api/axios";

const BASE = "/employees";

// Create employee from candidate
export const createEmployee = async (employeeData) => {
  const response = await api.post(`${BASE}`, employeeData);
  return response.data;
};

// Get all employees
export const getAllEmployees = async () => {
  const response = await api.get(`${BASE}`);
  return response.data;
};

// Get employees by status
export const getEmployeesByStatus = async (status) => {
  const response = await api.get(`${BASE}/status/${status}`);
  return response.data;
};

// Get employees by department
export const getEmployeesByDepartment = async (department) => {
  const response = await api.get(`${BASE}/department/${department}`);
  return response.data;
};

// Get employee by ID
export const getEmployeeById = async (employeeId) => {
  const response = await api.get(`${BASE}/${employeeId}`);
  return response.data;
};

// Get employee by employee code
export const getEmployeeByCode = async (employeeCode) => {
  const response = await api.get(`${BASE}/code/${employeeCode}`);
  return response.data;
};

// Update employee
export const updateEmployee = async (employeeId, employeeData) => {
  const response = await api.put(`${BASE}/${employeeId}`, employeeData);
  return response.data;
};

// Relieve employee
export const relieveEmployee = async (employeeId, relievingDate, notes) => {
  const response = await api.put(`${BASE}/${employeeId}/relieve`, null, {
    params: { relievingDate, notes },
  });
  return response.data;
};
