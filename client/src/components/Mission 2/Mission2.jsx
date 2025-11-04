import React, { useEffect, useState } from "react";
import apiClient from "../../lib/api";

const Mission2 = () => {
  const [facilities, setFacilities] = useState([]);
  const [nearest, setNearest] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Example: user location (longitude, latitude)
  const userLocation = [90.4125, 23.8103]; // Dhaka coordinates for demo

  // Fetch all facilities
  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/healthmap/facilities");
      setFacilities(response.data);
    } catch (err) {
      console.error("Facilities fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch facilities");
    } finally {
      setLoading(false);
    }
  };

  // Fetch nearest facilities
  const fetchNearest = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post("/healthmap/nearest", {
        location: userLocation,
        limit: 5,
        maxDistance: 5000,
      });
      setNearest(response.data);
    } catch (err) {
      console.error("Nearest fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch nearest facilities");
    } finally {
      setLoading(false);
    }
  };

  // Fetch health workers nearby
  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/healthmap/workers", {
        params: {
          location: userLocation.join(","), // "lng,lat"
          radius: 3000,
        },
      });
      setWorkers(response.data);
    } catch (err) {
      console.error("Workers fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch health workers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
    fetchNearest();
    fetchWorkers();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-emerald-600 mb-4 text-center">
        Mission 2: Health Map
      </h2>

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-red-600 text-center mb-2">{error}</p>}

      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2 text-emerald-700">All Facilities:</h3>
        <ul className="list-disc list-inside">
          {facilities.map((f) => (
            <li key={f._id}>
              {f.name} ({f.type}) - {f.upazila}, {f.district}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2 text-emerald-700">Nearest Facilities:</h3>
        <ul className="list-disc list-inside">
          {nearest.map((f) => (
            <li key={f._id}>
              {f.name} ({f.type}) - Distance: {f.distance ? Math.round(f.distance) + "m" : "N/A"}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-2 text-emerald-700">Nearby Health Workers:</h3>
        <ul className="list-disc list-inside">
          {workers.map((w) => (
            <li key={w._id}>
              {w.name} - Skills: {w.skills?.join(", ") || "N/A"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Mission2;
