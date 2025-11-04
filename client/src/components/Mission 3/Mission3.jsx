import {
  AlertTriangle,
  Clock,
  Globe,
  Hash,
  HeartHandshake,
  Loader2,
  LocateFixed,
  MessageSquare,
  Send,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// --- MOCK API IMPLEMENTATION (Replacing external import) ---
// This section simulates the backend responses for demonstration purposes.

const MOCK_NEAREST = [
  { _id: "f1", name: "Dhaka Medical College Hospital", type: "Hospital", distance: 1200 },
  { _id: "f2", name: "Mohakhali Health Clinic", type: "Clinic", distance: 2500 },
  { _id: "f3", name: "Tejgaon Community Health Center", type: "Center", distance: 4800 },
];

const MOCK_WORKERS = [
  { _id: "w1", name: "রহিম মিয়া", skills: ["প্রাথমিক চিকিৎসা", "টিকা"] },
  { _id: "w2", name: "জেসমিন আক্তার", skills: ["মাতৃত্বকালীন যত্ন", "পুষ্টি পরামর্শ"] },
  { _id: "w3", name: "কামাল হোসেন", skills: ["জরুরী সাড়া", "রোগ নিয়ন্ত্রণ"] },
];

const MOCK_CATEGORIES = {
  categories: [
    { id: "fever", name: "জ্বর ও ঠান্ডা" },
    { id: "pain", name: "শরীরের ব্যথা" },
    { id: "child", name: "শিশু স্বাস্থ্য" },
    { id: "mental", name: "মানসিক স্বাস্থ্য" },
    { id: "general", name: "সাধারণ স্বাস্থ্য" },
  ]
};

const MOCK_TRUST_INFO = {
  privacy: {
    anonymous: "আপনার পরিচয় গোপন রাখা হবে।",
    noTracking: "আপনার কোনো ব্যক্তিগত ডেটা ট্র্যাক করা হয় না।",
    dataRetention: "পরামর্শের পর তথ্য মুছে ফেলা হয়।",
    encryption: "সমস্ত যোগাযোগ এনক্রিপ্ট করা হয়।"
  }
};

const MOCK_ANON_RESPONSE = {
  response: {
    primaryAdvice: "দ্রুত একজন ডাক্তারের সাথে পরামর্শ করুন। এটি সাধারণ ফ্লু হতে পারে।",
    immediateActions: "পর্যাপ্ত বিশ্রাম নিন, প্যারাসিটামল খান এবং প্রচুর পানি পান করুন।",
    culturalConsiderations: "পরিবারের বয়স্ক সদস্যদের থেকে দূরত্ব বজায় রাখুন এবং ঐতিহ্যবাহী খাবার খেতে পারেন যা আরোগ্য লাভে সহায়তা করে।"
  }
};

const apiClient = {
  get: (url, config = {}) => {
    // reference config to avoid "assigned but never used" lint warnings
    const params = config.params || {};
    return new Promise(resolve => {
      setTimeout(() => {
        if (url === "/anonymous-health/categories") {
          resolve({ data: MOCK_CATEGORIES });
        } else if (url === "/anonymous-health/trust-info") {
          resolve({ data: MOCK_TRUST_INFO });
        } else if (url === "/healthmap/workers") {
          // Mocking the use of location but returning static data
          const limit = params.limit || MOCK_WORKERS.length;
          resolve({ data: MOCK_WORKERS.slice(0, limit) });
        } else {
          resolve({ data: [] });
        }
      }, 500); // Simulate network latency
    });
  },
  post: (url, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (url === "/healthmap/nearest") {
          // Mocking the use of location but returning static data
          resolve({ data: MOCK_NEAREST });
        } else if (url === "/anonymous-health/request") {
          // Basic form validation simulation
          const symptomsArray = Array.isArray(data.symptoms) ? data.symptoms : (data.symptoms || "").split(",").filter(s => s.trim().length > 0);
          if (!data.category || symptomsArray.length === 0) {
            reject({ response: { data: { message: "অনুগ্রহ করে বিষয় এবং উপসর্গ লিখুন।" } } });
          }
          resolve({ data: MOCK_ANON_RESPONSE });
        } else {
          reject({ response: { data: { message: "Invalid endpoint." } } });
        }
      }, 1000); // Simulate longer AI processing time
    });
  }
};
// --- END MOCK API IMPLEMENTATION ---

const DEFAULT_LOCATION_NAME = "Dhaka, Bangladesh (ডিফল্ট)";
const DEFAULT_LOCATION_COORDS = { lat: 23.8103, lng: 90.4125 }; // [lat, lng]

const Mission3 = () => {
  // --- STATE FOR HEALTH MAP DATA ---
  const [nearest, setNearest] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false); // Global loading for Map/Workers
  const [globalError, setGlobalError] = useState("");

  // --- NEW LOCATION STATES ---
  const [userLocation, setUserLocation] = useState(null); // { lat: number, lng: number, isDefault?: boolean }
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  // --- STATE FOR ANONYMOUS HEALTH ---
  const [categories, setCategories] = useState([]);
  const [trustInfo, setTrustInfo] = useState({});
  const [anonRequest, setAnonRequest] = useState({
    category: "",
    severity: "mild",
    symptoms: "", // Changed to string for easier input handling
    ageGroup: "adult",
    gender: "prefer_not_to_say",
    location: "Dhaka",
    urgency: "information",
    preferredLanguage: "bangla",
    culturalContext: "",
  });
  const [anonResponse, setAnonResponse] = useState(null);
  const [anonLoading, setAnonLoading] = useState(false);
  const [anonError, setAnonError] = useState(""); // Dedicated error for form submission

  // UI State
  const [activeTab, setActiveTab] = useState('map'); // 'map' or 'anon'

  // --- LOCATION FETCHING FUNCTION ---
  const fetchUserLocation = useCallback(() => {
    setIsLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      const errMsg = "❌ Geolocation is not supported by your browser. Using default location.";
      setLocationError(errMsg);
      setUserLocation({ ...DEFAULT_LOCATION_COORDS, isDefault: true });
      setIsLocationLoading(false);
      return;
    }

    // Success callback
    const success = (position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setIsLocationLoading(false);
    };

    // Error callback
    const error = (err) => {
      console.error("Geolocation Error:", err);
      let errMsg = "❌ অবস্থান অ্যাক্সেস অস্বীকার করা হয়েছে বা ব্যর্থ হয়েছে। ডিফল্ট অবস্থান ব্যবহার করা হচ্ছে।";
      if (err.code === 1) errMsg = "❌ অবস্থান অ্যাক্সেস অস্বীকার করা হয়েছে। ডিফল্ট অবস্থান ব্যবহার করা হচ্ছে।";
      if (err.code === 2) errMsg = "❌ অবস্থান উপলব্ধ নয়। ডিফল্ট অবস্থান ব্যবহার করা হচ্ছে।";
      if (err.code === 3) errMsg = "❌ অবস্থানের অনুরোধ সময় অতিক্রম করেছে। ডিফল্ট অবস্থান ব্যবহার করা হচ্ছে।";

      setLocationError(errMsg);
      setUserLocation({ ...DEFAULT_LOCATION_COORDS, isDefault: true });
      setIsLocationLoading(false);
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  }, []);

  // --- DATA FETCHING (Combined and Location Dependent) ---
  const fetchHealthData = useCallback(async (location) => {
    // API expects [lng, lat], but our state is {lat, lng}
    const locationToSend = [location.lng, location.lat];

    try {
      setLoading(true);
      setGlobalError("");

      // 1. Fetch Nearest Facilities (POST)
      const nearestRes = await apiClient.post("/healthmap/nearest", {
        location: locationToSend,
        limit: 5,
        maxDistance: 5000,
      });
      setNearest(nearestRes.data);

      // 2. Fetch Health Workers (GET)
      const workersRes = await apiClient.get("/healthmap/workers", {
        params: {
          location: locationToSend.join(","),
          radius: 3000,
        },
      });
      setWorkers(workersRes.data);
    } catch (err) {
      console.error("Health Data Fetch error:", err);
      const errorMsg = err.response?.data?.message || `❌ স্বাস্থ্য তথ্য লোড করতে ব্যর্থ হয়েছে।`;
      setGlobalError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []); // Dependencies are stable

  // Fetch meta data (independent of map data)
  const fetchAnonymousMeta = useCallback(async () => {
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
  }, []);

  // --- EFFECT FOR INITIAL DATA LOAD ---
  useEffect(() => {
    // 1. Start location fetching immediately
    fetchUserLocation();
    // 2. Fetch metadata (can run in parallel)
    fetchAnonymousMeta();
  }, [fetchUserLocation, fetchAnonymousMeta]);

  // Effect to fetch map data whenever location is ready (not null and not loading)
  useEffect(() => {
    if (userLocation && !isLocationLoading) {
      fetchHealthData(userLocation);
    }
  }, [userLocation, isLocationLoading, fetchHealthData]);

  // --- ANONYMOUS REQUEST HANDLER (Unchanged) ---
  const handleAnonSubmit = async (e) => {
    e.preventDefault();
    setAnonError(""); // Clear previous form errors
    try {
      setAnonLoading(true);
      setAnonResponse(null);

      const payload = {
        ...anonRequest,
        // Convert comma-separated string back to array for API
        symptoms: anonRequest.symptoms.split(",").map(s => s.trim()).filter(s => s.length > 0)
      };

      const response = await apiClient.post("/anonymous-health/request", payload);
      setAnonResponse(response.data.response);
    } catch (err) {
      console.error("Anonymous request error:", err);
      // Using in-app message instead of alert() and ensuring correct error access
      const errorMsg = err.response?.data?.message || "❌ অনুরোধ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।";
      setAnonError(errorMsg);
    } finally {
      setAnonLoading(false);
    }
  };

  // --- RENDERING FUNCTIONS FOR TABS ---

  const renderHealthMapList = () => (
    <div className="space-y-6">

      {/* Location Bar (Dynamically updated) */}
      <div className="bg-emerald-50 dark:bg-emerald-900/40 p-3 rounded-xl flex items-start border-l-4 border-emerald-500 shadow-inner">
        {isLocationLoading && (
          <div className="flex items-center text-emerald-800 dark:text-emerald-200 font-medium text-sm">
            <Loader2 className="w-5 h-5 text-emerald-700 dark:text-emerald-300 mr-3 shrink-0 animate-spin" />
            অবস্থান লোড হচ্ছে... অনুগ্রহ করে অ্যাক্সেসের অনুমতি দিন।
          </div>
        )}
        {!isLocationLoading && (
          <>
            <LocateFixed className="w-5 h-5 text-emerald-700 dark:text-emerald-300 mr-3 shrink-0 mt-0.5" />
            <div>
              <p className="text-emerald-800 dark:text-emerald-200 font-medium text-sm">
                বর্তমান অবস্থান:
                {userLocation && !userLocation.isDefault
                  ? `Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}`
                  : DEFAULT_LOCATION_NAME}
              </p>
              {locationError && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                  {locationError}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Global Loading and Error for Data */}
      {loading && <div className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" /><p className="text-gray-600 dark:text-gray-400 mt-2">স্বাস্থ্য তথ্য লোড হচ্ছে...</p></div>}
      {globalError && <div className="p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl flex items-center"><AlertTriangle className="w-5 h-5 mr-2" />{globalError}</div>}

      {/* Facility Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Nearest Facilities List */}
        <div className="p-5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
          <div className="flex items-center mb-4 border-b pb-2 border-gray-200 dark:border-gray-600">
            <Stethoscope className="w-6 h-6 mr-3 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">নিকটবর্তী সুবিধা ({nearest.length})</h3>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {nearest.length > 0 ? (
              nearest.map((f, index) => (
                <div key={f._id || index} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center transition hover:bg-emerald-50 dark:hover:bg-gray-700">
                  <HeartHandshake className="w-5 h-5 mr-3 shrink-0 text-red-500" />
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
              !loading && <p className="text-center text-gray-600 dark:text-gray-400">কোন নিকটবর্তী সুবিধা পাওয়া যায়নি।</p>
            )}
          </div>
        </div>

        {/* Nearby Health Workers List */}
        <div className="p-5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
          <div className="flex items-center mb-4 border-b pb-2 border-gray-200 dark:border-gray-600">
            <Users className="w-6 h-6 mr-3 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">নিকটবর্তী স্বাস্থ্য কর্মী ({workers.length})</h3>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {workers.length > 0 ? (
              workers.map((w, index) => (
                <div key={w._id || index} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center transition hover:bg-emerald-50 dark:hover:bg-gray-700">
                  <UserCheck className="w-5 h-5 mr-3 shrink-0 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{w.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      দক্ষতা: <span className="font-medium text-blue-700 dark:text-blue-300">{w.skills?.join(", ") || "N/A"}</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              !loading && <p className="text-center text-gray-600 dark:text-gray-400">এই এলাকায় কোনো কর্মী পাওয়া যায়নি।</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnonForm = () => (
    <div className="space-y-6">

      {/* Trust & Privacy Info */}
      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center mb-2">
          <ShieldCheck className="w-6 h-6 mr-3 text-emerald-700 dark:text-emerald-300" />
          <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">গোপনীয়তা ও নির্ভরতা</h4>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          {trustInfo.privacy && (
            <>
              <p>• {trustInfo.privacy.anonymous}</p>
              <p>• {trustInfo.privacy.noTracking}</p>
            </>
          )}
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            **জরুরী অবস্থা বা গুরুতর স্বাস্থ্য সমস্যার জন্য এটি ব্যবহার করবেন না। সরাসরি ডাক্তার বা হাসপাতালের সাথে যোগাযোগ করুন।**
          </p>
        </p>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleAnonSubmit}>
        {/* Category & Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"><Hash className="w-4 h-4 mr-1 text-emerald-600" /> বিষয় নির্বাচন করুন</label>
            <select
              className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
              value={anonRequest.category}
              onChange={e => setAnonRequest({ ...anonRequest, category: e.target.value })}
              required
            >
              <option value="">-- নির্বাচন করুন --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"><Globe className="w-4 h-4 mr-1 text-emerald-600" /> পছন্দের ভাষা</label>
            <select
              className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
              value={anonRequest.preferredLanguage}
              onChange={e => setAnonRequest({ ...anonRequest, preferredLanguage: e.target.value })}
            >
              <option value="bangla">বাংলা</option>
              <option value="english">English</option>
            </select>
          </div>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"><Clock className="w-4 h-4 mr-1 text-emerald-600" /> গুরুত্ব (Severity)</label>
          <div className="flex justify-between space-x-2">
            {['mild', 'moderate', 'severe'].map(level => (
              <button
                key={level}
                type="button"
                onClick={() => setAnonRequest({ ...anonRequest, severity: level })}
                className={`w-full py-2 rounded-xl text-sm font-medium transition duration-150 border-2 ${anonRequest.severity === level
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-emerald-50 dark:hover:bg-gray-700'
                  }`}
              >
                {level === 'mild' ? 'স্বল্প' : level === 'moderate' ? 'মাঝারি' : 'গুরুতর'}
              </button>
            ))}
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"><MessageSquare className="w-4 h-4 mr-1 text-emerald-600" /> উপসর্গ (কমা দিয়ে আলাদা করুন)</label>
          <input
            type="text"
            placeholder="উদাহরণ: জ্বর, মাথা ব্যাথা, ক্লান্তি"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
            value={anonRequest.symptoms}
            onChange={e => setAnonRequest({ ...anonRequest, symptoms: e.target.value })}
            required
          />
        </div>

        {/* Context/Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"><Globe className="w-4 h-4 mr-1 text-emerald-600" /> অতিরিক্ত বিবরণ (ঐচ্ছিক)</label>
          <textarea
            placeholder="আপনার প্রশ্ন বা পরিস্থিতি বর্ণনা করুন..."
            rows="3"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
            value={anonRequest.culturalContext}
            onChange={e => setAnonRequest({ ...anonRequest, culturalContext: e.target.value })}
          />
        </div>

        {/* Form Error */}
        {anonError && (
          <div className="p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl flex items-center"><AlertTriangle className="w-5 h-5 mr-2" />{anonError}</div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={anonLoading || !anonRequest.category || !anonRequest.symptoms}
          className="w-full h-12 bg-emerald-600 text-white py-2 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-emerald-500/30"
        >
          {anonLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> অনুরোধ জমা হচ্ছে...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              গোপনীয় পরামর্শের জন্য পাঠান
            </>
          )}
        </button>
      </form>

      {/* AI Response Area */}
      {anonResponse && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-600 rounded-xl text-blue-800 dark:text-blue-200 shadow-md space-y-2">
          <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center"><Stethoscope className="w-5 h-5 mr-2" /> AI থেকে পরামর্শ</h4>
          <p className="text-sm"><strong>প্রাথমিক পরামর্শ:</strong> {anonResponse.primaryAdvice}</p>
          <p className="text-sm"><strong>তাৎক্ষণিক পদক্ষেপ:</strong> {anonResponse.immediateActions}</p>
          {anonResponse.culturalConsiderations && <p className="text-sm"><strong>সাংস্কৃতিক বিবেচনা:</strong> {anonResponse.culturalConsiderations}</p>}
        </div>
      )}
    </div>
  );

  // --- MAIN COMPONENT RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-10 font-sans">
      <div className="max-w-4xl w-full mx-auto bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700">

        {/* Main Title */}
        <div className="flex items-center justify-center mb-6 border-b border-emerald-200 dark:border-emerald-800 pb-4">
          <HeartHandshake className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mr-3" />
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Mission 3: স্বাস্থ্য সেবা সংযোগ
          </h2>
        </div>

        {/* --- TAB NAVIGATION --- */}
        <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 text-lg font-semibold transition-colors duration-200 ${activeTab === 'map'
              ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500'
              }`}
          >
            <LocateFixed className="inline w-5 h-5 mr-2" /> নিকটবর্তী সুবিধা
          </button>
          <button
            onClick={() => setActiveTab('anon')}
            className={`px-4 py-2 text-lg font-semibold transition-colors duration-200 ${activeTab === 'anon'
              ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500'
              }`}
          >
            <ShieldCheck className="inline w-5 h-5 mr-2" /> গোপনীয় পরামর্শ
          </button>
        </div>

        {/* --- TAB CONTENT --- */}
        {activeTab === 'map' && renderHealthMapList()}
        {activeTab === 'anon' && renderAnonForm()}

      </div>
    </div>
  );
};

export default Mission3;
