import React, { useEffect, useMemo, useState } from "react";
import {
  getReportSummary,
  runCustomReport,
} from "../../services/reportService";
import Loader from "../../components/Loader";

const defaultStartDate = () => {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString().slice(0, 10);
};

const today = new Date().toISOString().slice(0, 10);

const statusOptions = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
  "ON_HOLD",
  "WITHDRAWN",
];

const ReportsPage = () => {
  const [startDate, setStartDate] = useState(defaultStartDate());
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [customFilters, setCustomFilters] = useState({});
  const [customResults, setCustomResults] = useState(null);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getReportSummary(startDate, endDate);
      setSummary(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitCustomReport = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const payload = {
        startDate: customFilters.startDate || undefined,
        endDate: customFilters.endDate || undefined,
        minExperience: customFilters.minExperience
          ? Number(customFilters.minExperience)
          : undefined,
        maxExperience: customFilters.maxExperience
          ? Number(customFilters.maxExperience)
          : undefined,
        positions: undefined,
      };
      if (customFilters.positionIds) {
        payload.positionIds = customFilters.positionIds
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
          .map((v) => Number(v));
      }
      if (customFilters.statuses) {
        payload.statuses = customFilters.statuses;
      }
      if (customFilters.skills) {
        payload.skills = customFilters.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (customFilters.colleges) {
        payload.colleges = customFilters.colleges
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
      }
      const data = await runCustomReport(payload);
      setCustomResults(data);
    } catch (err) {
      console.error(err);
      setError("Failed to run custom report.");
    } finally {
      setLoading(false);
    }
  };

  const renderStatusChip = (label, value) => (
    <div className="flex items-center justify-between border rounded-lg px-3 py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value ?? 0}</span>
    </div>
  );

  const cards = useMemo(() => {
    if (!summary) return [];
    const p = summary.candidateProcessSummary || {};
    return [
      { label: "Total Applications", value: p.totalApplications },
      { label: "Applied", value: p.appliedCount },
      { label: "Screening", value: p.screeningCount },
      { label: "Interview", value: p.interviewCount },
      { label: "Selected", value: p.selectedCount },
      { label: "Rejected", value: p.rejectedCount },
      { label: "On Hold", value: p.onHoldCount },
      { label: "Withdrawn", value: p.withdrawnCount },
    ];
  }, [summary]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reporting & Analytics</h1>
            <p className="text-gray-600 mt-1">Position-wise, college-wise, process, interviewer, date, technology, and experience views.</p>
          </div>
          <form
            className="flex flex-wrap items-end gap-3 bg-white rounded-lg shadow px-4 py-3"
            onSubmit={(e) => { e.preventDefault(); fetchSummary(); }}
          >
            <div className="flex flex-col text-sm">
              <label className="text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5"
              />
            </div>
            <div className="flex flex-col text-sm">
              <label className="text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
            >
              Refresh
            </button>
          </form>
        </div>

        {loading && <Loader />}
        {error && (
          <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {summary && (
          <div className="space-y-8">
            {/* Process Summary */}
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Candidate Process Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {cards.map((card) => renderStatusChip(card.label, card.value))}
              </div>
            </section>

            {/* Position-wise */}
            <section className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Position-wise Reports</h2>
                <span className="text-sm text-gray-500">
                  Total: {summary.positionReports?.length || 0}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Position</th>
                      <th className="px-3 py-2">Applications</th>
                      <th className="px-3 py-2">Applied</th>
                      <th className="px-3 py-2">Screening</th>
                      <th className="px-3 py-2">Interview</th>
                      <th className="px-3 py-2">Selected</th>
                      <th className="px-3 py-2">Rejected</th>
                      <th className="px-3 py-2">On Hold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary.positionReports || []).map((row) => (
                      <tr
                        key={row.positionId}
                        className="border-b last:border-0"
                      >
                        <td className="px-3 py-2 font-medium">
                          {row.jobTitle}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.totalApplications}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.appliedCount}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.screeningCount}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.interviewCount}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.selectedCount}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.rejectedCount}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.onHoldCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* College-wise */}
            <section className="bg-white/90 border border-slate-200 shadow-sm rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-3">
                College-wise Report
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100/80">
                    <tr>
                      <th className="px-3 py-2 text-left">College</th>
                      <th className="px-3 py-2">Candidates</th>
                      <th className="px-3 py-2">Applications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary.collegeReports || []).map((row) => (
                      <tr
                        key={row.collegeName}
                        className="border-b last:border-0"
                      >
                        <td className="px-3 py-2">{row.collegeName}</td>
                        <td className="px-3 py-2 text-center">
                          {row.candidateCount}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.applicationCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Interviewer summary */}
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-3">Interviewer Summary</h2>
              {(summary.interviewerSummaries || []).length === 0 ? (
                <p className="text-sm text-gray-500">No interviewer data available for the selected period.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Interviewer</th>
                        <th className="px-3 py-2">Assigned</th>
                        <th className="px-3 py-2">Completed</th>
                        <th className="px-3 py-2">No Show</th>
                        <th className="px-3 py-2">Avg Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.interviewerSummaries.map((row) => (
                        <tr key={row.userId} className="border-b last:border-0">
                          <td className="px-3 py-2">{row.name}</td>
                          <td className="px-3 py-2 text-center">{row.interviewsAssigned}</td>
                          <td className="px-3 py-2 text-center">{row.completed}</td>
                          <td className="px-3 py-2 text-center">{row.noShows}</td>
                          <td className="px-3 py-2 text-center">{row.averageRating}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Date-wise summary */}
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-3">Date-wise Summary</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2">Total</th>
                      <th className="px-3 py-2">Applied</th>
                      <th className="px-3 py-2">Screening</th>
                      <th className="px-3 py-2">Interview</th>
                      <th className="px-3 py-2">Selected</th>
                      <th className="px-3 py-2">Rejected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary.dailySummaries || []).map((row) => (
                      <tr key={row.date} className="border-b last:border-0">
                        <td className="px-3 py-2">{row.date}</td>
                        <td className="px-3 py-2 text-center">
                          {row.totalApplications}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.appliedCount}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.screeningCount}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.interviewCount}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.selectedCount}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.rejectedCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Technology & Experience */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-3">
                  Technology-wise Profiles
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-100/80">
                      <tr>
                        <th className="px-3 py-2 text-left">Skill</th>
                        <th className="px-3 py-2">Candidates</th>
                        <th className="px-3 py-2">Avg Exp (yrs)</th>
                        <th className="px-3 py-2">Verified</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(summary.technologyProfiles || []).map((row) => (
                        <tr
                          key={row.skillName}
                          className="border-b last:border-0"
                        >
                          <td className="px-3 py-2">{row.skillName}</td>
                          <td className="px-3 py-2 text-center">
                            {row.candidateCount}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {row.averageYearsOfExperience}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {row.verifiedSkillCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-3">
                  Experience-wise Candidates
                </h2>
                <div className="space-y-2">
                  {(summary.experienceBuckets || []).map((row) => (
                    <div
                      key={row.bucketLabel}
                      className="flex items-center justify-between border rounded px-3 py-2"
                    >
                      <span>{row.bucketLabel}</span>
                      <span className="font-semibold text-[var(--primary-color)]">
                        {row.candidateCount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Custom Report Filter Bar */}
            <section className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Custom Report</h2>
                {customResults && (
                  <button
                    type="button"
                    onClick={() => setCustomResults(null)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear results
                  </button>
                )}
              </div>

              <form onSubmit={submitCustomReport}>
                {/* Filter Bar Row */}
                <div className="flex flex-wrap gap-3 items-end pb-4 border-b border-gray-100">
                  <div className="flex flex-col text-sm min-w-[130px]">
                    <label className="text-gray-500 mb-1">From</label>
                    <input
                      type="date"
                      className="border border-gray-300 rounded-md px-2 py-1.5"
                      value={customFilters.startDate || ""}
                      onChange={(e) => setCustomFilters({ ...customFilters, startDate: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col text-sm min-w-[130px]">
                    <label className="text-gray-500 mb-1">To</label>
                    <input
                      type="date"
                      className="border border-gray-300 rounded-md px-2 py-1.5"
                      value={customFilters.endDate || ""}
                      onChange={(e) => setCustomFilters({ ...customFilters, endDate: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col text-sm min-w-[150px]">
                    <label className="text-gray-500 mb-1">Skills</label>
                    <input
                      type="text"
                      placeholder="e.g. React, Java"
                      className="border border-gray-300 rounded-md px-2 py-1.5"
                      value={customFilters.skills || ""}
                      onChange={(e) => setCustomFilters({ ...customFilters, skills: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col text-sm min-w-[150px]">
                    <label className="text-gray-500 mb-1">College</label>
                    <input
                      type="text"
                      placeholder="e.g. IIT, MIT"
                      className="border border-gray-300 rounded-md px-2 py-1.5"
                      value={customFilters.colleges || ""}
                      onChange={(e) => setCustomFilters({ ...customFilters, colleges: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 text-sm">
                    <div className="flex flex-col min-w-[80px]">
                      <label className="text-gray-500 mb-1">Min Exp (yrs)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="border border-gray-300 rounded-md px-2 py-1.5 w-full"
                        value={customFilters.minExperience || ""}
                        onChange={(e) => setCustomFilters({ ...customFilters, minExperience: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col min-w-[80px]">
                      <label className="text-gray-500 mb-1">Max Exp (yrs)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="20"
                        className="border border-gray-300 rounded-md px-2 py-1.5 w-full"
                        value={customFilters.maxExperience || ""}
                        onChange={(e) => setCustomFilters({ ...customFilters, maxExperience: e.target.value })}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium self-end"
                  >
                    Run Report
                  </button>
                </div>

                {/* Status Toggles */}
                <div className="flex flex-wrap gap-2 pt-3">
                  <span className="text-sm text-gray-500 self-center mr-1">Status:</span>
                  {statusOptions.map((status) => {
                    const selected = (customFilters.statuses || []).includes(status);
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => {
                          const current = customFilters.statuses || [];
                          setCustomFilters({
                            ...customFilters,
                            statuses: selected
                              ? current.filter((s) => s !== status)
                              : [...current, status],
                          });
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          selected
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                  {(customFilters.statuses || []).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCustomFilters({ ...customFilters, statuses: [] })}
                      className="text-xs text-gray-400 hover:text-gray-600 self-center ml-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>

              {/* Results */}
              {customResults && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      {customResults.rows?.length || 0} result{(customResults.rows?.length || 0) !== 1 ? "s" : ""} found
                    </p>
                  </div>

                  {customResults.summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {renderStatusChip("Total", customResults.summary.totalApplications)}
                      {renderStatusChip("Applied", customResults.summary.appliedCount)}
                      {renderStatusChip("Screening", customResults.summary.screeningCount)}
                      {renderStatusChip("Interview", customResults.summary.interviewCount)}
                      {renderStatusChip("Selected", customResults.summary.selectedCount)}
                      {renderStatusChip("Rejected", customResults.summary.rejectedCount)}
                      {renderStatusChip("On Hold", customResults.summary.onHoldCount)}
                      {renderStatusChip("Withdrawn", customResults.summary.withdrawnCount)}
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Candidate</th>
                          <th className="px-3 py-2">Email</th>
                          <th className="px-3 py-2">Position</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Applied</th>
                          <th className="px-3 py-2">Exp (yrs)</th>
                          <th className="px-3 py-2">College</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(customResults.rows || []).map((row) => (
                          <tr key={row.applicationId} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium">{row.candidateName}</td>
                            <td className="px-3 py-2 text-gray-600">{row.email}</td>
                            <td className="px-3 py-2">{row.positionTitle}</td>
                            <td className="px-3 py-2 text-center">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {row.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">{row.appliedAt?.slice(0, 10) || "—"}</td>
                            <td className="px-3 py-2 text-center">{row.totalExperience ?? "—"}</td>
                            <td className="px-3 py-2">{row.collegeName || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;

