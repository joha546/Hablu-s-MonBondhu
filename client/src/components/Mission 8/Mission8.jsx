import React, { useEffect, useState } from "react";
import apiClient from "../../lib/api";

const Mission8 = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    fetchWorkers();
    fetchSkills();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (search) params.q = search;
      if (skillFilter) params.skill = skillFilter;
      const res = await apiClient.get("/health-workers", { params });
      setWorkers(res.data.workers);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch workers");
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await apiClient.get("/health-workers/skills");
      setSkills(res.data.skills);
    } catch (err) {
      console.error("Error fetching skills:", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-4xl mx-auto mt-6 space-y-6">
      <h2 className="text-2xl font-bold text-emerald-600 mb-4 text-center">
        Mission 8: Health Worker Directory
      </h2>

      <div className="flex gap-2 flex-wrap mb-4">
        <input
          type="text"
          placeholder="Search by name or skill"
          className="p-2 border rounded-lg flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="p-2 border rounded-lg"
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
        >
          <option value="">All Skills</option>
          {skills.map((skill) => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>
        <button
          onClick={fetchWorkers}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading workers...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-4">
        {workers.map((worker) => (
          <div
            key={worker._id}
            className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            <h3 className="font-semibold text-lg text-emerald-700">{worker.nameBangla}</h3>
            <p className="text-gray-700">Skills: {worker.skills.join(", ")}</p>
            <p className="text-gray-500 text-sm">
              Upazila: {worker.upazila} | Verified: {worker.verified?.isVerified ? "Yes" : "No"}
            </p>
          </div>
        ))}
        {workers.length === 0 && !loading && <p className="text-gray-500 text-center">No workers found.</p>}
      </div>
    </div>
  );
};

export default Mission8;
