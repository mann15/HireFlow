import React, { useEffect, useState } from "react";
import { getDocumentTypes } from "../../services/documentService";
import api from "../../api/axios";

const DocumentTypesManagement = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [error, setError] = useState("");

  const loadTypes = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDocumentTypes();
      setTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load document types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    setCreating(true);
    setError("");
    try {
      const response = await api.post("/documents/types", {
        name: newTypeName.trim(),
      });
      const created = response.data;
      setTypes((prev) => [...prev, created]);
      setNewTypeName("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create document type");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 mt-20">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Document Types Management
        </h1>
        <p className="text-gray-600 mt-2">
          Admin and HR can define the document types candidates must upload.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Document Type</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="e.g. ID Proof, Offer Letter, Experience Letter"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {creating ? "Creating..." : "Create Document Type"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb  -4">
            <h2 className="text-xl font-semibold">Existing Document Types</h2>
            <button
              onClick={loadTypes}
              disabled={loading}
              className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          {loading ? (
            <div className="py-8 text-center text-gray-500">
              Loading document types...
            </div>
          ) : types.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No document types defined yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {types.map((type) => (
                <li key={type.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{type.name}</p>
                    <p className="text-xs text-gray-500">
                      ID: {type.id} &mdash; candidates will see this as an option
                      when uploading documents.
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentTypesManagement;

