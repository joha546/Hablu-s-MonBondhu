import { default as React, useEffect, useState } from "react";
import apiClient from "../../lib/api";



const Mission2 = () => {
  const [facilities, setFacilities] = useState([]);
  const [nearest, setNearest] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Anonymous Health states
  const [categories, setCategories] = useState([]);
  const [trustInfo, setTrustInfo] = useState({});
  const [anonRequest, setAnonRequest] = useState({
    category: "",
    severity: "mild",
    symptoms: [],
    ageGroup: "adult",
    gender: "prefer_not_to_say",
    location: "",
    urgency: "information",
    preferredLanguage: "bangla",
    culturalContext: "",
  });
  const [anonResponse, setAnonResponse] = useState(null);
  const [anonLoading, setAnonLoading] = useState(false);

  const userLocation = [90.4125, 23.8103]; // Dhaka coordinates demo

  // Fetch Health Map data
  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/healthmap/facilities");
      setFacilities(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch facilities");
    } finally {
      setLoading(false);
    }
  };

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
      setError(err.response?.data?.message || "Failed to fetch nearest facilities");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/healthmap/workers", {
        params: { location: userLocation.join(","), radius: 3000 },
      });
      setWorkers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch health workers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Anonymous Health categories & trust info
  const fetchAnonymousMeta = async () => {
    try {
      const [catRes, trustRes] = await Promise.all([
        apiClient.get("/anonymous-health/categories"),
        apiClient.get("/anonymous-health/trust-info"),
      ]);
      setCategories(catRes.data.categories);
      setTrustInfo(trustRes.data);
    } catch (err) {
      console.error("Anonymous meta fetch error:", err);
    }
  };

  const handleAnonSubmit = async (e) => {
    e.preventDefault();
    try {
      setAnonLoading(true);
      setAnonResponse(null);
      const response = await apiClient.post("/anonymous-health/request", anonRequest);
      setAnonResponse(response.data.response);
    } catch (err) {
      console.error("Anonymous request error:", err);
      alert(err.response?.data?.message || "Request failed");
    } finally {
      setAnonLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
    fetchNearest();
    fetchWorkers();
    fetchAnonymousMeta();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-3xl mx-auto mt-6 space-y-6">
      <h2 className="text-2xl font-bold text-emerald-600 text-center">
        Mission 2: Health Map & Anonymous Health
      </h2>

      {/* Health Map Section */}
      {loading && <p className="text-center text-gray-500">Loading Health Map...</p>}
      {error && <p className="text-red-600 text-center">{error}</p>}

      <div>
        <h3 className="font-semibold text-lg mb-2 text-emerald-700">All Facilities:</h3>
        <ul className="list-disc list-inside">
          {facilities.map(f => (
            <li key={f._id}>{f.name} ({f.type}) - {f.upazila}, {f.district}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-2 text-emerald-700">Nearest Facilities:</h3>
        <ul className="list-disc list-inside">
          {nearest.map(f => (
            <li key={f._id}>{f.name} ({f.type}) - Distance: {f.distance ? Math.round(f.distance) + "m" : "N/A"}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-2 text-emerald-700">Nearby Health Workers:</h3>
        <ul className="list-disc list-inside">
          {workers.map(w => (
            <li key={w._id}>{w.name} - Skills: {w.skills?.join(", ") || "N/A"}</li>
          ))}
        </ul>
      </div>

      {/* Anonymous Health Section */}
      <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <h3 className="font-semibold text-lg mb-2 text-emerald-700">Submit Anonymous Health Request</h3>

        <form className="space-y-2" onSubmit={handleAnonSubmit}>
          <select
            className="w-full p-2 border rounded"
            value={anonRequest.category}
            onChange={e => setAnonRequest({ ...anonRequest, category: e.target.value })}
            required
          >
            <option value="">Select Category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Symptoms (comma separated)"
            className="w-full p-2 border rounded"
            value={anonRequest.symptoms.join(", ")}
            onChange={e => setAnonRequest({ ...anonRequest, symptoms: e.target.value.split(",").map(s => s.trim()) })}
            required
          />

          <textarea
            placeholder="Additional description (optional)"
            className="w-full p-2 border rounded"
            value={anonRequest.culturalContext}
            onChange={e => setAnonRequest({ ...anonRequest, culturalContext: e.target.value })}
          />

          <button
            type="submit"
            disabled={anonLoading}
            className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700"
          >
            {anonLoading ? "Submitting..." : "Submit"}
          </button>
        </form>

        {/* AI Response */}
        {anonResponse && (
          <div className="mt-3 p-2 border border-blue-200 bg-blue-50 rounded text-blue-800">
            <p><strong>Primary Advice:</strong> {anonResponse.primaryAdvice}</p>
            <p><strong>Immediate Actions:</strong> {anonResponse.immediateActions}</p>
            {anonResponse.culturalConsiderations && <p><strong>Cultural Considerations:</strong> {anonResponse.culturalConsiderations}</p>}
          </div>
        )}

        {/* Trust Info */}
        {trustInfo.privacy && (
          <div className="mt-3 text-sm text-gray-700">
            <p><strong>Privacy:</strong> {trustInfo.privacy.anonymous}</p>
            <p>{trustInfo.privacy.noTracking}</p>
            <p>{trustInfo.privacy.dataRetention}</p>
            <p>{trustInfo.privacy.encryption}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mission2;
