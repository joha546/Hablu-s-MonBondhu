import React, { useEffect, useState } from "react";
import apiClient from "../../lib/api";

const Mission6 = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [guides, setGuides] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get("/symptom-guide/categories");
        setCategories(res.data.categories);
      } catch (err) {
        setError(err.response?.data?.message || "Categories could not be loaded");
      }
    };
    fetchCategories();
  }, []);

  // Fetch guides by category
  const fetchGuidesByCategory = async (categoryId) => {
    try {
      setLoading(true);
      setError("");
      const res = await apiClient.get(`/symptom-guide/category/${categoryId}`);
      setGuides(res.data.guides);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch guides");
    } finally {
      setLoading(false);
    }
  };

  // Search guides by keyword
  const searchGuides = async () => {
    if (!searchQuery) return;
    try {
      setLoading(true);
      setError("");
      const res = await apiClient.get(`/symptom-guide/search?q=${encodeURIComponent(searchQuery)}`);
      setGuides(res.data.results);
      setSelectedCategory(null);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-4xl mx-auto mt-6 space-y-6">
      <h2 className="text-2xl font-bold text-emerald-600 text-center mb-4">
        Mission 6: Awareness Guide
      </h2>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search symptom guides..."
          className="flex-1 p-2 border rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={searchGuides}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Search
        </button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              fetchGuidesByCategory(cat.id);
            }}
            className={`px-4 py-2 rounded-lg border ${selectedCategory === cat.id
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-gray-700 border-gray-300"
              }`}
          >
            {cat.nameBangla}
          </button>
        ))}
      </div>

      {/* Loading/Error */}
      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Guides */}
      {guides.length > 0 && (
        <div className="space-y-4">
          {guides.map((guide) => (
            <div
              key={guide._id}
              className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <h3 className="font-semibold text-lg text-emerald-700">{guide.titleBangla}</h3>
              <p className="text-gray-700">{guide.descriptionBangla}</p>
            </div>
          ))}
        </div>
      )}

      {guides.length === 0 && !loading && !error && (
        <p className="text-gray-500 text-center">No guides to display.</p>
      )}
    </div>
  );
};

export default Mission6;
