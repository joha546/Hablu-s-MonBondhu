import React, { useEffect, useState } from "react";
import apiClient from "../../lib/api";

const Mission7 = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ eventType: "", upazila: "", status: "" });

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const query = new URLSearchParams(filters).toString();
      const res = await apiClient.get(`/health-events?${query}`);
      setEvents(res.data.events);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch events");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-4xl mx-auto mt-6 space-y-6">
      <h2 className="text-2xl font-bold text-emerald-600 text-center mb-4">
        Mission 7: Health Events
      </h2>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Upazila"
          className="p-2 border rounded-lg flex-1"
          value={filters.upazila}
          onChange={(e) => setFilters({ ...filters, upazila: e.target.value })}
        />
        <select
          className="p-2 border rounded-lg"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={fetchEvents}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Apply Filters
        </button>
      </div>

      {/* Loading / Error */}
      {loading && <p className="text-gray-500">Loading events...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event._id}
            className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            <h3 className="font-semibold text-lg text-emerald-700">{event.titleBangla}</h3>
            <p className="text-gray-700">{event.descriptionBangla}</p>
            <p className="text-gray-500 text-sm">
              {new Date(event.startDate).toLocaleDateString()} - {event.status}
            </p>
          </div>
        ))}
        {events.length === 0 && !loading && <p className="text-gray-500 text-center">No events found.</p>}
      </div>
    </div>
  );
};

export default Mission7;
