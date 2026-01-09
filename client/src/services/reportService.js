import api from "../api/axios";

export const getReportSummary = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await api.get("/reports/summary", { params });
  return response.data;
};

export const runCustomReport = async (filters) => {
  const response = await api.post("/reports/custom", filters || {});
  return response.data;
};
