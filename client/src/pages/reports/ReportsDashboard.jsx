import React, { useState, useEffect } from "react";
import { reportService } from "../../services/apiService";
import { FiBarChart2, FiDownload, FiFilter } from "react-icons/fi";

const ReportsDashboard = () => {
  const [reportType, setReportType] = useState("recruitment-summary");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let data;
      switch (reportType) {
        case "recruitment-summary":
          data = await reportService.getRecruitmentSummary();
          break;
        case "college-wise":
          data = await reportService.getCollegeReport();
          break;
        case "technology-wise":
          data = await reportService.getTechnologyReport();
          break;
        case "interviewer-summary":
          data = await reportService.getInterviewerReport();
          break;
        case "date-wise":
          data = await reportService.getDateWiseReport(
            dateRange.startDate,
            dateRange.endDate
          );
          break;
        default:
          data = await reportService.getRecruitmentSummary();
      }
      setReportData(data);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csvContent = generateCSV();
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent)
    );
    element.setAttribute(
      "download",
      `report-${reportType}-${new Date().getTime()}.csv`
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generateCSV = () => {
    if (!reportData) return "";

    let csv = `Report: ${reportType}\nGenerated: ${new Date().toLocaleString()}\n\n`;

    if (Array.isArray(reportData)) {
      if (reportData.length === 0) return csv + "No data available";

      const keys = Object.keys(reportData[0]);
      csv += keys.join(",") + "\n";
      reportData.forEach((row) => {
        csv += keys.map((key) => `"${row[key]}"`).join(",") + "\n";
      });
    } else {
      csv += JSON.stringify(reportData, null, 2);
    }

    return csv;
  };

  const RecruitmentSummary = ({ data }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Total Positions Created
          </h4>
          <p className="text-2xl font-bold text-gray-800">
            {data?.totalPositions || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Open Positions
          </h4>
          <p className="text-2xl font-bold text-gray-800">
            {data?.openPositions || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Total Applications
          </h4>
          <p className="text-2xl font-bold text-gray-800">
            {data?.totalApplications || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Candidates Selected
          </h4>
          <p className="text-2xl font-bold text-green-600">
            {data?.selectedCandidates || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Offers Sent
          </h4>
          <p className="text-2xl font-bold text-gray-800">
            {data?.offersSent || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Offers Accepted
          </h4>
          <p className="text-2xl font-bold text-green-600">
            {data?.offersAccepted || 0}
          </p>
        </div>
      </div>

      {data?.statusBreakdown && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Application Status Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(data.statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 w-40 truncate">
                  {status}
                </span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 text-xs text-white flex items-center justify-end pr-2"
                    style={{
                      width: `${(count / data.totalApplications) * 100}%`,
                    }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const CollegeWiseReport = ({ data }) => (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              College/University
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Candidates
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Selected
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Success Rate
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data?.map((item, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.collegeName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.totalCandidates}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.selectedCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {((item.selectedCount / item.totalCandidates) * 100).toFixed(2)}
                %
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const TechnologyWiseReport = ({ data }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data?.map((tech, idx) => (
        <div
          key={idx}
          className="bg-white p-4 rounded-lg shadow border border-gray-200"
        >
          <h4 className="text-lg font-semibold text-gray-800 mb-3">
            {tech.skillName}
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total:</span>
              <strong className="text-gray-800">{tech.totalCandidates}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Selected:</span>
              <strong className="text-gray-800">{tech.selectedCount}</strong>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Success Rate:</span>
              <strong className="text-green-600">
                {((tech.selectedCount / tech.totalCandidates) * 100).toFixed(2)}
                %
              </strong>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const InterviewerSummary = ({ data }) => (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Interviewer Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Interviews Conducted
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Avg Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recommendations
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data?.map((item, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.interviewerName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.interviewsCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.averageRating?.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.hireRecommendations}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderReport = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading report...</div>
        </div>
      );
    }

    if (!reportData) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">No data available</div>
        </div>
      );
    }

    switch (reportType) {
      case "recruitment-summary":
        return <RecruitmentSummary data={reportData} />;
      case "college-wise":
        return <CollegeWiseReport data={reportData} />;
      case "technology-wise":
        return <TechnologyWiseReport data={reportData} />;
      case "interviewer-summary":
        return <InterviewerSummary data={reportData} />;
      case "date-wise":
        return <RecruitmentSummary data={reportData} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-gray-50 mt-20 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiBarChart2 className="text-blue-500" /> Reports & Analytics
        </h1>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 p-4 bg-white rounded-lg shadow border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Select Report:
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="recruitment-summary">Recruitment Summary</option>
              <option value="college-wise">College-wise Report</option>
              <option value="technology-wise">Technology-wise Report</option>
              <option value="interviewer-summary">Interviewer Summary</option>
              <option value="date-wise">Date-wise Report</option>
            </select>
          </div>

          {reportType === "date-wise" && (
            <>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Start Date:
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  End Date:
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                className="mt-6 sm:mt-0 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                onClick={fetchReport}
              >
                <FiFilter /> Apply Filter
              </button>
            </>
          )}
        </div>

        <button
          className="mt-4 md:mt-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
          onClick={handleExport}
        >
          <FiDownload /> Export as CSV
        </button>
      </div>

      <div className="mt-6">{renderReport()}</div>
    </div>
  );
};

export default ReportsDashboard;
