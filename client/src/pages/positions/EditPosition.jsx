import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPositionById,
  updatePosition,
} from "../../services/positionService";

const EditPosition = () => {
  const { id } = useParams();
  const [position, setPosition] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const p = await getPositionById(id);
      setPosition(p);
    })();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePosition(id, position);
      navigate(`/positions/${position.positionId}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (!position) return <div className="container p-6">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Position</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label className="block font-medium">Job Title</label>
          <input
            value={position.jobTitle}
            onChange={(e) =>
              setPosition({ ...position, jobTitle: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Job Description</label>
          <textarea
            value={position.jobDescription}
            onChange={(e) =>
              setPosition({ ...position, jobDescription: e.target.value })
            }
            className="w-full border p-2 rounded"
            rows={6}
          />
        </div>
        <div>
          <label className="block font-medium">Status</label>
          <select
            value={position.status}
            onChange={(e) =>
              setPosition({ ...position, status: e.target.value })
            }
            className="w-full border p-2 rounded"
          >
            <option value="OPEN">OPEN</option>
            <option value="ON_HOLD">ON_HOLD</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
        <div>
          <button className="px-4 py-2 rounded bg-[var(--primary-color)] text-white">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPosition;
