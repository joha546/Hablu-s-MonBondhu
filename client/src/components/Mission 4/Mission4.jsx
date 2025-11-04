import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Filter,
  HeartPulse,
  Leaf,
  Loader2,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

// --- MOCK API CLIENT IMPLEMENTATION ---
// This mocks the backend service to resolve the import error and simulate data retrieval.

const MOCK_SEASONS = [
  { id: "winter", name: "Winter", nameBangla: "শীতকাল" },
  { id: "summer", name: "Summer", nameBangla: "গ্রীষ্মকাল" },
  { id: "monsoon", name: "Monsoon", nameBangla: "বর্ষাকাল" },
];

const MOCK_CATEGORIES = [
  { id: "nutrition", name: "Nutrition", nameBangla: "পুষ্টি" },
  { id: "immunity", name: "Immunity", nameBangla: "রোগ প্রতিরোধ" },
  { id: "hydration", name: "Hydration", nameBangla: "জলীয়তা" },
];

const MOCK_TIPS = [
  { _id: "t1", title: "শীতকালীন যত্ন", category: "immunity", description: "শীতকালে রোগ প্রতিরোধ ক্ষমতা বাড়াতে ভিটামিন সি সমৃদ্ধ খাবার খান এবং উষ্ণ পোশাক পরুন।" },
  { _id: "t2", title: "প্রচুর পানি পান করুন", category: "hydration", description: "যদিও গরম কম, তবুও শরীরকে আর্দ্র রাখতে নিয়মিত কুসুম গরম পানি পান করা জরুরি।" },
  { _id: "t3", title: "গরম স্যুপ", category: "nutrition", description: "ঠান্ডা থেকে বাঁচতে গরম স্যুপ ও ভেজিটেবল স্ট্যু খাদ্য তালিকায় রাখুন।" },

  // Summer Tips
  { _id: "t4", title: "তাপমাত্রা থেকে বাঁচুন", category: "hydration", description: "গ্রীষ্মকালে ডিহাইড্রেশন এড়াতে প্রচুর ইলেক্ট্রোলাইট এবং ডাবের পানি পান করুন।" },
  { _id: "t5", title: "হালকা খাবার", category: "nutrition", description: "পেটের সমস্যা এড়াতে হালকা ও সহজে হজম হয় এমন খাবার খান।" },

  // Monsoon Tips
  { _id: "t6", title: "মশা থেকে সতর্ক", category: "immunity", description: "বর্ষাকালে মশা বাহিত রোগ প্রতিরোধের জন্য মশারী ব্যবহার করুন এবং জল জমতে দেবেন না।" },
  { _id: "t7", title: "পাকা ফল", category: "nutrition", description: "বর্ষায় বাসি খাবার ও রাস্তার খাবার এড়িয়ে চলুন।" },
];

const apiClient = {
  get: (url, config = {}) => {
    return new Promise(resolve => {
      setTimeout(() => { // Simulate network latency
        if (url === "/seasonal-health/current") {
          // Mock current tips (e.g., Winter tips t1, t2, t3)
          resolve({ data: { tips: MOCK_TIPS.filter(t => t._id === 't1' || t._id === 't2' || t._id === 't3') } });
        } else if (url === "/seasonal-health/seasons") {
          resolve({ data: { seasons: MOCK_SEASONS } });
        } else if (url === "/seasonal-health/categories") {
          resolve({ data: { categories: MOCK_CATEGORIES } });
        } else if (url.startsWith("/seasonal-health/season/")) {
          const seasonId = url.split('/').pop();
          const categoryFilter = config.params?.category;

          let filteredTips = [];

          // Basic filtering logic based on season
          if (seasonId === 'winter') {
            filteredTips = MOCK_TIPS.filter(t => t._id === 't1' || t._id === 't2' || t._id === 't3');
          } else if (seasonId === 'summer') {
            filteredTips = MOCK_TIPS.filter(t => t._id === 't4' || t._id === 't5');
          } else if (seasonId === 'monsoon') {
            filteredTips = MOCK_TIPS.filter(t => t._id === 't6' || t._id === 't7');
          }

          if (categoryFilter) {
            filteredTips = filteredTips.filter(t => t.category === categoryFilter);
          }

          resolve({ data: { tips: filteredTips } });

        } else {
          resolve({ data: { tips: [] } });
        }
      }, 500);
    });
  },
};
// --- END MOCK API CLIENT ---


const Mission4 = () => {
  const [currentTips, setCurrentTips] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tipsByFilter, setTipsByFilter] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Memoized title for the filtered section
  const selectedTitle = useMemo(() => {
    const season = seasons.find(s => s.id === selectedSeason)?.nameBangla;
    const category = categories.find(c => c.id === selectedCategory)?.nameBangla;

    if (selectedSeason === "" && selectedCategory === "") return "সকল স্বাস্থ্য টিপস";

    if (season && category) return `${season} ও ${category} স্বাস্থ্য টিপস`;
    if (season) return `${season} স্বাস্থ্য টিপস`;
    if (category) return `${category} স্বাস্থ্য টিপস`;

    return "ফিল্টার করা টিপস";
  }, [selectedSeason, selectedCategory, seasons, categories]);


  // Fetch current season tips
  const fetchCurrentTips = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/seasonal-health/current");
      setCurrentTips(response.data.tips);
      // Initialize filtered tips with current tips if no filter is set
      setTipsByFilter(response.data.tips);
    } catch (err) {
      setError(err.response?.data?.message || "❌ বর্তমান সিজনের টিপস লোড করতে ব্যর্থ।");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all seasons and categories
  const fetchSeasonsAndCategories = useCallback(async () => {
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
  }, []);

  // Fetch tips by selected filter (used a slightly modified version of user's logic)
  const fetchTipsByFilter = useCallback(async () => {
    // If filters are cleared, reset to current tips and stop API call
    if (!selectedSeason && !selectedCategory) {
      setTipsByFilter(currentTips);
      return;
    }

    try {
      setLoading(true);
      setError(""); // Clear error before new fetch
      const params = {};
      if (selectedCategory) params.category = selectedCategory;

      const response = selectedSeason
        ? await apiClient.get(`/seasonal-health/season/${selectedSeason}`, { params })
        : await apiClient.get("/seasonal-health/current", { params });
      // In a real app, if selectedSeason is empty but category is set, the API might handle
      // finding the current season internally. We use the user's logic here.

      setTipsByFilter(response.data.tips);
    } catch (err) {
      setError(err.response?.data?.message || "❌ ফিল্টার করা টিপস লোড করতে ব্যর্থ।");
      setTipsByFilter([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSeason, selectedCategory, currentTips]); // Dependency on currentTips is crucial

  // Initial Data Load
  useEffect(() => {
    fetchCurrentTips();
    fetchSeasonsAndCategories();
  }, [fetchCurrentTips, fetchSeasonsAndCategories]);

  // Data Fetch on Filter Change
  useEffect(() => {
    fetchTipsByFilter();
  }, [selectedSeason, selectedCategory, fetchTipsByFilter]);


  // --- UI COMPONENTS ---

  const TipCard = ({ tip }) => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 transition hover:shadow-lg hover:border-emerald-300">
      <div className="flex items-center mb-2">
        <CheckCircle className="w-5 h-5 mr-3 text-emerald-500 shrink-0" />
        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
          {categories.find(c => c.id === tip.category)?.nameBangla || tip.category}
        </p>
      </div>
      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{tip.title}</h4>
      <p className="text-gray-600 dark:text-gray-300 text-base">{tip.description}</p>
    </div>
  );

  const TipsList = ({ title, tips }) => (
    <div className="space-y-4">
      <h3 className="font-extrabold text-2xl text-gray-800 dark:text-white border-b pb-2 border-emerald-200 dark:border-emerald-800 flex items-center">
        {title}
      </h3>
      {loading ? (
        <div className="text-center py-6">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400 mt-2">টিপস লোড হচ্ছে...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />{error}
        </div>
      ) : tips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map(tip => (
            <TipCard key={tip._id} tip={tip} />
          ))}
        </div>
      ) : (
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl text-center text-gray-600 dark:text-gray-400">
          <Leaf className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
          কোনো টিপস পাওয়া যায়নি। ফিল্টার পরিবর্তন করে দেখুন।
        </div>
      )}
    </div>
  );

  // --- MAIN COMPONENT RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-10 font-sans">
      <div className="max-w-4xl w-full mx-auto bg-gray-100 dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 space-y-8">

        {/* Main Title */}
        <div className="flex items-center justify-center mb-6 border-b border-emerald-300 dark:border-emerald-700 pb-4">
          <HeartPulse className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mr-3" />
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Mission 4: ঋতুভিত্তিক স্বাস্থ্য টিপস
          </h2>
        </div>

        {/* --- Filter Section --- */}
        <div className="p-5 bg-white dark:bg-gray-700 rounded-2xl shadow-xl border border-emerald-100 dark:border-emerald-900">
          <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2" /> টিপস ফিল্টার করুন
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Season Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"><Calendar className="w-4 h-4 mr-1 text-emerald-500" /> ঋতু নির্বাচন</label>
              <select
                className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 transition duration-150"
                value={selectedSeason}
                onChange={e => setSelectedSeason(e.target.value)}
              >
                <option value="">সকল ঋতু</option>
                {seasons.map(season => (
                  <option key={season.id} value={season.id}>{season.nameBangla}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"><Zap className="w-4 h-4 mr-1 text-emerald-500" /> ক্যাটেগরি নির্বাচন</label>
              <select
                className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 transition duration-150"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                <option value="">সকল ক্যাটেগরি</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nameBangla}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Button */}
          {(selectedSeason || selectedCategory) && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setSelectedSeason("");
                  setSelectedCategory("");
                }}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 transition duration-150"
              >
                ফিল্টার মুছুন
              </button>
            </div>
          )}

        </div>

        {/* --- Tips List (Shows Current or Filtered) --- */}
        <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
          <TipsList
            title={selectedSeason || selectedCategory ? selectedTitle : "বর্তমান সিজনের জন্য বিশেষ টিপস"}
            tips={tipsByFilter}
          />
        </div>

      </div>
    </div>
  );
};

export default Mission4;
