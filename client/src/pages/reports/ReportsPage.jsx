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
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <span className="text-[var(--primary-color)] font-semibold text-base">
        {value ?? 0}
      </span>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/40 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">
              Insights Workspace
            </p>
            <h1 className="text-3xl font-bold text-slate-800">
              Reporting & Analytics
            </h1>
            <p className="text-slate-600 mt-1">
              Position-wise, college-wise, process, interviewer, date,
              technology, and experience views. Admin/HR only.
            </p>
          </div>
          <form
            className="flex flex-wrap items-end gap-3 bg-white/90 border border-slate-200 shadow-sm px-4 py-3 rounded-xl"
            onSubmit={(e) => {
              e.preventDefault();
              fetchSummary();
            }}
          >
            <div className="flex flex-col text-sm">
              <label className="text-gray-500">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
            <div className="flex flex-col text-sm">
              <label className="text-gray-500">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
            <button
              type="submit"
              className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary-color-dark)]"
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
            <section className="bg-white/90 border border-slate-200 shadow-sm rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-3">
                Candidate Process Summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
                {cards.map((card) => renderStatusChip(card.label, card.value))}
              </div>
            </section>

            {/* Position-wise */}
            <section className="bg-white/90 border border-slate-200 shadow-sm rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Position-wise Reports</h2>
                <span className="text-sm text-gray-500">
                  Total: {summary.positionReports?.length || 0}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100/80">
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
            <section className="bg-white/90 border border-slate-200 shadow-sm rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-3">
                Interviewer Summary
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100/80">
                    <tr>
                      <th className="px-3 py-2 text-left">Interviewer</th>
                      <th className="px-3 py-2">Assigned</th>
                      <th className="px-3 py-2">Completed</th>
                      <th className="px-3 py-2">No Show</th>
                      <th className="px-3 py-2">Avg Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary.interviewerSummaries || []).map((row) => (
                      <tr key={row.userId} className="border-b last:border-0">
                        <td className="px-3 py-2">{row.name}</td>
                        <td className="px-3 py-2 text-center">
                          {row.interviewsAssigned}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.completed}
                        </td>
                        <td className="px-3 py-2 text-center">{row.noShows}</td>
                        <td className="px-3 py-2 text-center">
                          {row.averageRating}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Date-wise summary */}
            <section className="bg-white/90 border border-slate-200 shadow-sm rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-3">Date-wise Summary</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100/80">
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
              <div className="bg-white/90 border border-slate-200 shadow-sm rounded-xl p-5">
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

              <div className="bg-white/90 border border-slate-200 shadow-sm rounded-xl p-5">
                <h2 className="text-lg font-semibold mb-3">
                  Experience-wise Candidates
                </h2>
                <div className="space-y-2">
                  {(summary.experienceBuckets || []).map((row) => (
                    <div
                      key={row.bucketLabel}
                      className="flex items-center justify-between bg-white/80 border rounded px-3 py-2"
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

            {/* Custom reporting */}
            <section className="bg-white/90 border border-slate-200 shadow-sm rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-4">
                Custom Report (Admin/HR)
              </h2>
              <form
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                onSubmit={submitCustomReport}
              >
                <div className="flex flex-col text-sm">
                  <label className="text-gray-500">Start Date</label>
                  <input
                    type="date"
                    className="border rounded px-2 py-1"
                    value={customFilters.startDate || ""}
                    onChange={(e) =>
                      setCustomFilters({
                        ...customFilters,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col text-sm">
                  <label className="text-gray-500">End Date</label>
                  <input
                    type="date"
                    className="border rounded px-2 py-1"
                    value={customFilters.endDate || ""}
                    onChange={(e) =>
                      setCustomFilters({
                        ...customFilters,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col text-sm">
                  <label className="text-gray-500">Position IDs (comma)</label>
                  <input
                    type="text"
                    className="border rounded px-2 py-1"
                    value={customFilters.positionIds || ""}
                    onChange={(e) =>
                      setCustomFilters({
                        ...customFilters,
                        positionIds: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col text-sm">
                  <label className="text-gray-500">Statuses</label>
                  <select
                    multiple
                    className="border rounded px-2 py-1"
                    value={customFilters.statuses || []}
                    onChange={(e) =>
                      setCustomFilters({
                        ...customFilters,
                        statuses: Array.from(
                          e.target.selectedOptions,
                          (o) => o.value,
                        ),
                      })
                    }
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col text-sm">
                  <label className="text-gray-500">Skills (comma)</label>
                  <input
                    type="text"
                    className="border rounded px-2 py-1"
                    value={customFilters.skills || ""}
                    onChange={(e) =>
                      setCustomFilters({
                        ...customFilters,
                        skills: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col text-sm">
                  <label className="text-gray-500">Colleges (comma)</label>
                  <input
                    type="text"
                    className="border rounded px-2 py-1"
                    value={customFilters.colleges || ""}
                    onChange={(e) =>
                      setCustomFilters({
                        ...customFilters,
                        colleges: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col text-sm">
                  <label className="text-gray-500">
                    Min Experience (years)
                  </label>
                  <input
                    type="number"
                    className="border rounded px-2 py-1"
                    value={customFilters.minExperience || ""}
                    onChange={(e) =>
                      setCustomFilters({
                        ...customFilters,
                        minExperience: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col text-sm">
                  <label className="text-gray-500">
                    Max Experience (years)
                  </label>
                  <input
                    type="number"
                    className="border rounded px-2 py-1"
                    value={customFilters.maxExperience || ""}
                    onChange={(e) =>
                      setCustomFilters({
                        ...customFilters,
                        maxExperience: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary-color-dark)]"
                  >
                    Run Custom Report
                  </button>
                </div>
              </form>

              {customResults && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">
                    Results ({customResults.rows?.length || 0})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-100/80">
                        <tr>
                          <th className="px-3 py-2 text-left">Candidate</th>
                          <th className="px-3 py-2">Email</th>
                          <th className="px-3 py-2">Position</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Applied</th>
                          <th className="px-3 py-2">Experience</th>
                          <th className="px-3 py-2">College</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(customResults.rows || []).map((row) => (
                          <tr
                            key={row.applicationId}
                            className="border-b last:border-0"
                          >
                            <td className="px-3 py-2">{row.candidateName}</td>
                            <td className="px-3 py-2">{row.email}</td>
                            <td className="px-3 py-2">{row.positionTitle}</td>
                            <td className="px-3 py-2 text-center">
                              {row.status}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {row.appliedAt?.slice(0, 10) || "-"}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {row.totalExperience ?? "-"}
                            </td>
                            <td className="px-3 py-2">
                              {row.collegeName || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {customResults.summary && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {renderStatusChip(
                        "Total",
                        customResults.summary.totalApplications,
                      )}
                      {renderStatusChip(
                        "Applied",
                        customResults.summary.appliedCount,
                      )}
                      {renderStatusChip(
                        "Screening",
                        customResults.summary.screeningCount,
                      )}
                      {renderStatusChip(
                        "Interview",
                        customResults.summary.interviewCount,
                      )}
                      {renderStatusChip(
                        "Selected",
                        customResults.summary.selectedCount,
                      )}
                      {renderStatusChip(
                        "Rejected",
                        customResults.summary.rejectedCount,
                      )}
                      {renderStatusChip(
                        "On Hold",
                        customResults.summary.onHoldCount,
                      )}
                      {renderStatusChip(
                        "Withdrawn",
                        customResults.summary.withdrawnCount,
                      )}
                    </div>
                  )}
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
