import React, { useEffect, useState } from "react";
import apiClient from "../../lib/api";

const Mission5 = () => {
  const [maternalRecord, setMaternalRecord] = useState(null);
  const [childRecord, setChildRecord] = useState(null);
  const [ancVisits, setAncVisits] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Example: Fetch maternal record by ID
  const fetchMaternalRecord = async (id) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/maternal-child-health/maternal/${id}`);
      setMaternalRecord(res.data);

      const ancRes = await apiClient.get(`/maternal-child-health/maternal/${id}/anc-visits`);
      setAncVisits(ancRes.data.upcomingVisits);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch maternal record");
    } finally {
      setLoading(false);
    }
  };

  // Example: Fetch child record by ID
  const fetchChildRecord = async (id) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/maternal-child-health/child/${id}`);
      setChildRecord(res.data);

      const vacRes = await apiClient.get(`/maternal-child-health/child/${id}/vaccinations`);
      setVaccinations(vacRes.data.upcomingVaccinations);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch child record");
    } finally {
      setLoading(false);
    }
  };

  // Example: On component mount, fetch sample records (replace with real IDs)
  useEffect(() => {
    const sampleMaternalId = "MATERNAL_RECORD_ID";
    const sampleChildId = "CHILD_RECORD_ID";

    fetchMaternalRecord(sampleMaternalId);
    fetchChildRecord(sampleChildId);
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-4xl mx-auto mt-6 space-y-6">
      <h2 className="text-2xl font-bold text-emerald-600 text-center">
        Mission 5: Maternal & Child Health
      </h2>

      {loading && <p className="text-gray-500 text-center">Loading...</p>}
      {error && <p className="text-red-600 text-center">{error}</p>}

      {/* Maternal Record */}
      {maternalRecord && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <h3 className="font-semibold text-lg text-emerald-700 mb-2">Maternal Record</h3>
          <p><strong>LMP:</strong> {new Date(maternalRecord.lmp).toLocaleDateString()}</p>
          <p><strong>EDD:</strong> {new Date(maternalRecord.edd).toLocaleDateString()}</p>
          <p><strong>Gravida:</strong> {maternalRecord.gravida}</p>
          <p><strong>Para:</strong> {maternalRecord.para}</p>
        </div>
      )}

      {/* ANC Visits */}
      {ancVisits.length > 0 && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <h3 className="font-semibold text-lg text-emerald-700 mb-2">Upcoming ANC Visits</h3>
          <ul className="list-disc list-inside">
            {ancVisits.map((visit, index) => (
              <li key={index}>
                Visit #{visit.visitNumber} - {new Date(visit.scheduledDate).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Child Record */}
      {childRecord && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-lg text-blue-700 mb-2">Child Record</h3>
          <p><strong>Name:</strong> {childRecord.name}</p>
          <p><strong>Sex:</strong> {childRecord.sex}</p>
          <p><strong>Birth Date:</strong> {new Date(childRecord.birthDate).toLocaleDateString()}</p>
          <p><strong>Birth Weight:</strong> {childRecord.birthWeight} kg</p>
        </div>
      )}

      {/* Vaccinations */}
      {vaccinations.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-lg text-blue-700 mb-2">Upcoming Vaccinations</h3>
          <ul className="list-disc list-inside">
            {vaccinations.map(vac => (
              <li key={vac._id}>
                {vac.name} - Scheduled on {new Date(vac.scheduledDate).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Mission5;
