import {
  AlertTriangle,
  Hospital,
  Loader2,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import apiClient from "../../lib/api";

// --- REACT-LEAFLET IMPORTS & CUSTOM ICON SETUP ---
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

// Custom icons for visual distinction on the map
const facilityIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const workerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
// --- END ICON SETUP ---

const Mission2 = () => {
  const [nearest, setNearest] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // User location [lat, lng] for Leaflet
  const userLocation = useMemo(() => ([23.8103, 90.4125]), []);
  // API location [lng, lat]
  const userApiLocation = useMemo(() => ([90.4125, 23.8103]), []);

  const apiCall = async (endpoint, setter, errorMessage, method = 'get', data = {}) => {
    try {
      setLoading(true);
      setError("");

      let response;
      if (method === 'post') {
        response = await apiClient.post(endpoint, data);
      } else {
        response = await apiClient.get(endpoint, { params: data });
      }

      if (response.data.length > 0) {
        const mappedData = response.data.map(item => ({
          ...item,
          // Convert [lng, lat] from API to [lat, lng] for Leaflet
          location: item.location && item.location.length === 2
            ? [item.location[1], item.location[0]]
            : null
        }));
        setter(mappedData);
      } else {
        setter(response.data);
      }
    } catch (err) {
      console.error(`${errorMessage} error:`, err);
      setError(err.response?.data?.message || `❌ ${errorMessage} failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearest = () => apiCall("/healthmap/nearest", setNearest, "Failed to fetch nearest facilities", 'post', {
    location: userApiLocation,
    limit: 5,
    maxDistance: 5000,
  });

  const fetchWorkers = () => apiCall("/healthmap/workers", setWorkers, "Failed to fetch health workers", 'get', {
    location: userApiLocation.join(","),
    radius: 3000,
  });

  useEffect(() => {
    fetchNearest();
    fetchWorkers();
  }, []);

  const mapMarkers = [...nearest, ...workers];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-10">
      <div className="max-w-6xl w-full mx-auto bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700">

        {/* Header */}
        <div className="flex items-center justify-center mb-8 border-b border-emerald-200 dark:border-emerald-800 pb-4">
          <MapIcon className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mr-3" />
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            স্বাস্থ্য ম্যাপ: সুবিধা ও কর্মী খুঁজুন
          </h2>
        </div>

        {/* User Location Info */}
        <div className="bg-emerald-50 dark:bg-emerald-900/40 p-3 rounded-xl mb-8 flex items-center border-l-4 border-emerald-500 dark:border-emerald-600 shadow-inner">
          <LocateFixed className="w-5 h-5 text-emerald-700 dark:text-emerald-300 mr-3 shrink-0" />
          <p className="text-emerald-800 dark:text-emerald-200 font-medium text-sm">
            বর্তমান অবস্থান (ডেমো): **Latitude: {userLocation[0]}, Longitude: {userLocation[1]}**
          </p>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-xl mb-6">
            <Loader2 className="w-5 h-5 mr-3 animate-spin text-emerald-600" />
            <p className="text-gray-700 dark:text-gray-300 font-medium">তথ্য লোড হচ্ছে...</p>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center p-4 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-600 rounded-xl mb-6">
            <AlertTriangle className="w-5 h-5 mr-3 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
          </div>
        )}

        {/* --- Map Container (RESPONSIVE 16:9 ASPECT RATIO) --- */}
        <div className="mb-10 p-2 bg-gray-100 dark:bg-gray-700 rounded-2xl border border-gray-300 dark:border-gray-600 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 p-3">
            <MapPin className="inline w-5 h-5 mr-2 text-emerald-600" />
            মানচিত্রে নিকটবর্তী অবস্থানসমূহ
          </h3>

          {/* THIS IS THE REQUESTED CONTAINER STRUCTURE: */}
          <div
            className="relative w-full rounded-xl overflow-hidden shadow-lg border border-gray-200"
            style={{ paddingBottom: '56.25%' }} // Creates 16:9 aspect ratio
          >
            <MapContainer
              center={userLocation}
              zoom={14}
              scrollWheelZoom={false}
              className="absolute inset-0 w-full h-full" // Fills the 16:9 parent container
            >
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* User's Location Marker */}
              <Marker position={userLocation} icon={userIcon}>
                <Popup>
                  <strong className="text-emerald-600">আপনার বর্তমান অবস্থান</strong>
                </Popup>
              </Marker>

              {/* Markers for Nearest Facilities and Workers */}
              {mapMarkers.map((item, index) => {
                if (!item.location) return null;
                const isFacility = item.type;
                const icon = isFacility ? facilityIcon : workerIcon;
                const label = isFacility ? item.name : item.name + ' (কর্মী)';

                return (
                  <Marker
                    key={index}
                    position={item.location}
                    icon={icon}
                  >
                    <Popup>
                      <strong className={isFacility ? "text-red-600" : "text-blue-600"}>{label}</strong>
                      {item.distance && <p>দূরত্ব: {Math.round(item.distance)}m</p>}
                      {item.skills && <p>দক্ষতা: {item.skills.join(', ')}</p>}
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* --- List View for Nearby Data --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Nearest Facilities List */}
          <div className="p-5 bg-emerald-50 dark:bg-emerald-900/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-lg">
            <div className="flex items-center mb-4">
              <MapPin className="w-6 h-6 mr-3 text-emerald-700 dark:text-emerald-300" />
              <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200">নিকটবর্তী সুবিধা ({nearest.length})</h3>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto p-2">
              {nearest.length > 0 ? (
                nearest.map((f, index) => (
                  <div key={f._id || index} className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-emerald-100 dark:border-emerald-700/50 flex items-center">
                    <Hospital className="w-5 h-5 mr-3 shrink-0 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {f.name} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({f.type})</span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        দূরত্ব: <span className="font-bold text-emerald-700 dark:text-emerald-300">{f.distance ? Math.round(f.distance) + "m" : "N/A"}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                !loading && <p className="text-center text-emerald-700 dark:text-emerald-300">কোন নিকটবর্তী সুবিধা পাওয়া যায়নি।</p>
              )}
            </div>
          </div>

          {/* Nearby Health Workers List */}
          <div className="p-5 bg-gray-100 dark:bg-gray-700 rounded-2xl border border-gray-300 dark:border-gray-600 shadow-md">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 mr-3 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">নিকটবর্তী স্বাস্থ্য কর্মী ({workers.length})</h3>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto p-2">
              {workers.length > 0 ? (
                workers.map((w, index) => (
                  <div key={w._id || index} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex items-center">
                    <UserCheck className="w-5 h-5 mr-3 shrink-0 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{w.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        দক্ষতা: <span className="font-medium text-blue-700 dark:text-blue-300">{w.skills?.join(", ") || "N/A"}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                !loading && <p className="text-center text-gray-700 dark:text-gray-300">এই এলাকায় কোনো কর্মী পাওয়া যায়নি।</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mission2;