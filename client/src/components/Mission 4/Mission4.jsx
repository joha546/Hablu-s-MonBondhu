import React, { useEffect, useState } from "react";
import apiClient from "../../lib/api";

const Mission4 = () => {
  const [currentTips, setCurrentTips] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tipsByFilter, setTipsByFilter] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch current season tips
  const fetchCurrentTips = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/seasonal-health/current");
      setCurrentTips(response.data.tips);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch current season tips");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all seasons and categories
  const fetchSeasonsAndCategories = async () => {
    try {
      const [seasonRes, categoryRes] = await Promise.all([
        apiClient.get("/seasonal-health/seasons"),
        apiClient.get("/seasonal-health/categories"),
      ]);
      setSeasons(seasonRes.data.seasons);
      setCategories(categoryRes.data.categories);
    } catch (err) {
      console.error("Error fetching seasons or categories:", err);
    }
  };

  // Fetch tips by selected filter
  const fetchTipsByFilter = async () => {
    if (!selectedSeason && !selectedCategory) return;
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory) params.category = selectedCategory;

      const response = selectedSeason
        ? await apiClient.get(`/seasonal-health/season/${selectedSeason}`, { params })
        : await apiClient.get("/seasonal-health/current", { params });

      setTipsByFilter(response.data.tips);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentTips();
    fetchSeasonsAndCategories();
  }, []);

  useEffect(() => {
    fetchTipsByFilter();
  }, [selectedSeason, selectedCategory]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-3xl mx-auto mt-6 space-y-6">
      <h2 className="text-2xl font-bold text-emerald-600 mb-4 text-center">
        Mission 4: Seasonal Health Tips
      </h2>

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-red-600 text-center">{error}</p>}

      {/* Current Season Tips */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg text-emerald-700 mb-2">Current Season Tips:</h3>
        {currentTips.length > 0 ? (
          <ul className="list-disc list-inside">
            {currentTips.map(tip => (
              <li key={tip._id}>
                <strong>{tip.title || tip.category}:</strong> {tip.description}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No tips available for the current season.</p>
        )}
      </div>

      {/* Filter by Season and Category */}
      <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
        <h3 className="font-semibold text-lg text-emerald-700">Filter Tips:</h3>
        <div className="flex gap-2 flex-wrap">
          <select
            className="p-2 border rounded"
            value={selectedSeason}
            onChange={e => setSelectedSeason(e.target.value)}
          >
            <option value="">Select Season</option>
            {seasons.map(season => (
              <option key={season.id} value={season.id}>{season.nameBangla}</option>
            ))}
          </select>

          <select
            className="p-2 border rounded"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nameBangla}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtered Tips */}
      <div>
        <h3 className="font-semibold text-lg text-emerald-700 mb-2">
          Tips {selectedSeason || selectedCategory ? "(Filtered)" : ""}
        </h3>
        {tipsByFilter.length > 0 ? (
          <ul className="list-disc list-inside">
            {tipsByFilter.map(tip => (
              <li key={tip._id}>
                <strong>{tip.title || tip.category}:</strong> {tip.description}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No tips available.</p>
        )}
      </div>
    </div>
  );
};

export default Mission4;
