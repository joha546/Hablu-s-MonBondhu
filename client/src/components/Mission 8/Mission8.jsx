import { Filter, HeartPulse, Loader2, MapPin, Search, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// --- MOCK DATA & API CLIENT (REPLACING EXTERNAL DEPENDENCY) ---

const MOCK_SKILLS = ["প্রাথমিক যত্ন", "মাতৃ ও শিশু স্বাস্থ্য", "পুষ্টি বিশেষজ্ঞ", "ডায়াবেটিস ব্যবস্থাপনা", "জরুরী সেবা"];

const MOCK_WORKERS = [
  { _id: 'w1', nameBangla: 'ফাতেমা বেগম', skills: ["প্রাথমিক যত্ন", "মাতৃ ও শিশু স্বাস্থ্য"], upazila: "সাভার", verified: { isVerified: true } },
  { _id: 'w2', nameBangla: 'আব্দুল করিম', skills: ["ডায়াবেটিস ব্যবস্থাপনা", "পুষ্টি বিশেষজ্ঞ"], upazila: "কেরানীগঞ্জ", verified: { isVerified: true } },
  { _id: 'w3', nameBangla: 'রহিমা আক্তার', skills: ["প্রাথমিক যত্ন", "জরুরী সেবা"], upazila: "সাভার", verified: { isVerified: false } },
  { _id: 'w4', nameBangla: 'মনসুর আলী', skills: ["পুষ্টি বিশেষজ্ঞ"], upazila: "ধামরাই", verified: { isVerified: true } },
  { _id: 'w5', nameBangla: 'আয়শা সিদ্দিকা', skills: ["মাতৃ ও শিশু স্বাস্থ্য", "প্রাথমিক যত্ন"], upazila: "সাভার", verified: { isVerified: true } },
];

// Mock API Client with filtering logic
const apiClient = {
  get: (url, config = {}) => {
    return new Promise(resolve => {
      setTimeout(() => {
        let data;

        // Mock Skills endpoint
        if (url === "/health-workers/skills") {
          data = { skills: MOCK_SKILLS };
        }
        // Mock Workers endpoint
        else if (url === "/health-workers") {
          const { q = "", skill = "" } = config.params || {};

          let filteredWorkers = MOCK_WORKERS;

          // Search filtering (name or skill)
          if (q) {
            const lowerQ = q.toLowerCase();
            filteredWorkers = filteredWorkers.filter(worker =>
              worker.nameBangla.toLowerCase().includes(lowerQ) ||
              worker.skills.some(s => s.toLowerCase().includes(lowerQ))
            );
          }

          // Skill filtering
          if (skill) {
            filteredWorkers = filteredWorkers.filter(worker =>
              worker.skills.includes(skill)
            );
          }

          data = { workers: filteredWorkers };
        }

        resolve({ data });
      }, 500); // Simulate network delay
    });
  },
};

// --- MISSION 8 COMPONENT ---

const Mission8 = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [skills, setSkills] = useState([]);

  // Fetch all available skills on mount
  const fetchSkills = useCallback(async () => {
    try {
      const res = await apiClient.get("/health-workers/skills");
      setSkills(res.data.skills);
    } catch (err) {
      console.error("Error fetching skills:", err);
    }
  }, []);

  // Fetch workers based on current state filters (q and skillFilter)
  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (search) params.q = search;
      if (skillFilter) params.skill = skillFilter;

      const res = await apiClient.get("/health-workers", { params });
      setWorkers(res.data.workers);
    } catch (err) {
      // Using a friendly message instead of relying on a non-existent API response structure
      setError("❌ স্বাস্থ্যকর্মীদের ডেটা আনতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }, [search, skillFilter]); // Dependencies included for clarity, though used only on manual button click

  // Initial Data Load (on mount)
  useEffect(() => {
    fetchWorkers();
    fetchSkills();
  }, [fetchSkills]); // Only fetchWorkers is intentionally excluded to prevent re-fetching on mount updates

  const handleSearchClick = () => {
    // Manual trigger of fetching workers when the button is clicked, using current state values
    fetchWorkers();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 max-w-5xl mx-auto mt-6 space-y-8 font-sans transition-colors duration-300">
      <h2 className="flex items-center justify-center text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-2 border-b pb-3 border-gray-200 dark:border-gray-700">
        <HeartPulse className="w-7 h-7 mr-3" />
        Mission 8: স্বাস্থ্যকর্মী নির্দেশিকা
      </h2>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-inner">

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="নাম বা দক্ষতার মাধ্যমে অনুসন্ধান করুন"
            className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 transition-all dark:bg-gray-900 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearchClick(); }}
          />
        </div>

        {/* Skill Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            className="w-full sm:w-48 appearance-none p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 transition-all dark:bg-gray-900 dark:text-white"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
          >
            <option value="">সকল দক্ষতা</option>
            {skills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearchClick}
          disabled={loading}
          className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl shadow-md hover:bg-emerald-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Search className="w-5 h-5 mr-2" />}
          অনুসন্ধান
        </button>
      </div>

      {/* Loading / Error / Results */}
      {error && (
        <div className="p-4 text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 rounded-lg font-medium border border-red-300">
          {error}
        </div>
      )}

      {loading && (
        <p className="text-gray-500 dark:text-gray-400 flex justify-center items-center py-6 text-lg">
          <Loader2 className="w-5 h-5 animate-spin mr-3 text-emerald-500" />
          কর্মী লোড হচ্ছে...
        </p>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {workers.map((worker) => (
            <div
              key={worker._id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between"
            >
              <div className="flex items-center mb-2 sm:mb-0">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-3 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">{worker.nameBangla}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <MapPin className="w-3 h-3 mr-1 text-emerald-500" />
                    উপজেলা: {worker.upazila}
                  </p>
                </div>
              </div>

              <div className="sm:text-right mt-2 sm:mt-0">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  দক্ষতা: <span className="text-emerald-600 dark:text-emerald-400">{worker.skills.join(", ")}</span>
                </p>
                <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${worker.verified?.isVerified
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  {worker.verified?.isVerified ? "✅ যাচাইকৃত" : "⚠️ যাচাই করা হয়নি"}
                </div>
              </div>
            </div>
          ))}
          {workers.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-6 border-t border-gray-200 dark:border-gray-700 mt-4">
              অনুসন্ধানের সাথে মিলে যাওয়া কোনো কর্মী পাওয়া যায়নি।
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Mission8;
