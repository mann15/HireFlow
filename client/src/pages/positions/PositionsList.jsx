import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPositions } from "../../services/positionService";
import PositionCard from "../../components/positions/PositionCard";

const PositionsList = () => {
  const [positions, setPositions] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const data = await getPositions();
      setPositions(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = positions.filter((p) => {
    const matchesQuery =
      p.jobTitle?.toLowerCase().includes(query.toLowerCase()) ||
      (p.jobDescription || "").toLowerCase().includes(query.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || p.status === statusFilter.toUpperCase();
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 mt-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">All Positions</h2>
        <Link
          to="/positions/add"
          className="px-4 py-2 rounded bg-[var(--primary-color)] text-white"
        >
          Add Position
        </Link>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or description"
          className="border p-2 rounded flex-1"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="text-gray-500">No positions found.</div>
        ) : (
          filtered.map((p) => <PositionCard key={p.positionId} position={p} />)
        )}
      </div>
    </div>
  );
};

export default PositionsList;
