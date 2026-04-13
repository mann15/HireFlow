import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { candidateService } from "../../services/candidateService";
import BulkUploadCandidates from "../../components/candidates/BulkUploadCandidates";

const AddCandidate = () => {
  const navigate = useNavigate();
  const { candidateId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [entryMode, setEntryMode] = useState("manual");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    currentLocation: "",
    preferredLocation: "",
    collegeName: "",
    totalExperience: "",
    currentSalary: "",
    expectedSalary: "",
    noticePeriod: "",
    source: "OTHER",
    sourceDetails: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert string values to appropriate types
      const candidateData = {
        ...formData,
        totalExperience: formData.totalExperience
          ? parseFloat(formData.totalExperience)
          : 0,
        currentSalary: formData.currentSalary
          ? parseFloat(formData.currentSalary)
          : null,
        expectedSalary: formData.expectedSalary
          ? parseFloat(formData.expectedSalary)
          : null,
        noticePeriod: formData.noticePeriod
          ? parseInt(formData.noticePeriod)
          : null,
      };

      if (candidateId) {
        await candidateService.updateCandidate(candidateId, candidateData);
      } else {
        await candidateService.createCandidate(candidateData);
      }
      navigate("/candidates");
    } catch (err) {
      setError(err.error || "Failed to create candidate");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If editing, fetch candidate and populate form
    let mounted = true;
    if (candidateId) {
      candidateService
        .getCandidateById(candidateId)
        .then((res) => {
          if (!mounted) return;
          if (res) {
            setFormData({
              firstName: res.firstName || "",
              lastName: res.lastName || "",
              email: res.email || "",
              phone: res.phone || "",
              alternatePhone: res.alternatePhone || "",
              currentLocation: res.currentLocation || "",
              preferredLocation: res.preferredLocation || "",
              collegeName: res.collegeName || "",
              totalExperience: res.totalExperience || "",
              currentSalary: res.currentSalary || "",
              expectedSalary: res.expectedSalary || "",
              noticePeriod: res.noticePeriod || "",
              source: res.source || "OTHER",
              sourceDetails: res.sourceDetails || "",
              linkedinUrl: res.linkedinUrl || "",
              githubUrl: res.githubUrl || "",
              portfolioUrl: res.portfolioUrl || "",
            });
          }
        })
        .catch((e) => {
          console.error("Failed to load candidate", e);
        });
    }
    return () => (mounted = false);
  }, [candidateId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Add New Candidate
            </h1>
            <div className="flex space-x-4">
              <div className="bg-gray-100 p-1 rounded-lg flex border border-gray-200">
                <button
                  type="button"
                  onClick={() => setEntryMode('manual')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${entryMode === 'manual' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode('bulk')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${entryMode === 'bulk' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Bulk Upload (Excel)
                </button>
              </div>
              <button
                onClick={() => navigate("/candidates")}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition duration-200 font-medium text-sm"
              >
                Back to List
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
              </div>
            )}

            {entryMode === 'bulk' ? (
              <div className="py-6">
                <BulkUploadCandidates onUploadComplete={() => navigate("/candidates")} />
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternate Phone
                    </label>
                    <input
                      type="tel"
                      name="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Location Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Location
                    </label>
                    <input
                      type="text"
                      name="currentLocation"
                      value={formData.currentLocation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Location
                    </label>
                    <input
                      type="text"
                      name="preferredLocation"
                      value={formData.preferredLocation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      College Name
                    </label>
                    <input
                      type="text"
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Professional Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Experience (Years)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="totalExperience"
                      value={formData.totalExperience}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Salary (LPA)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="currentSalary"
                      value={formData.currentSalary}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Salary (LPA)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="expectedSalary"
                      value={formData.expectedSalary}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notice Period (Days)
                    </label>
                    <input
                      type="number"
                      name="noticePeriod"
                      value={formData.noticePeriod}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Source Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Source Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source
                    </label>
                    <select
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="JOB_PORTAL">Job Portal</option>
                      <option value="REFERRAL">Referral</option>
                      <option value="WALK_IN">Walk In</option>
                      <option value="CAMPUS">Campus</option>
                      <option value="SOCIAL_MEDIA">Social Media</option>
                      <option value="COMPANY_WEBSITE">Company Website</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source Details
                    </label>
                    <input
                      type="text"
                      name="sourceDetails"
                      value={formData.sourceDetails}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Social Links
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio URL
                    </label>
                    <input
                      type="url"
                      name="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/candidates")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Candidate"}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCandidate;
