import {
  AlertTriangle,
  BookOpen,
  ListFilter,
  Loader2,
  Search,
  Tag,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// --- MOCK API CLIENT IMPLEMENTATION ---
// Simulating API responses for Symptom Guide data with Bengali content.

const MOCK_CATEGORIES = [
  { id: "fever", nameBangla: "জ্বর সংক্রান্ত" },
  { id: "respiratory", nameBangla: "শ্বাসযন্ত্রের সমস্যা" },
  { id: "digestive", nameBangla: "হজম সমস্যা" },
  { id: "maternal", nameBangla: "মাতৃত্বকালীন স্বাস্থ্য" },
];

const MOCK_GUIDES = [
  // Fever
  { _id: "g1", category: "fever", titleBangla: "সাধারণ জ্বরের প্রাথমিক চিকিৎসা", descriptionBangla: "শিশুদের এবং প্রাপ্তবয়স্কদের ক্ষেত্রে জ্বরের কারণে করণীয়। প্যারাসিটামল ব্যবহার এবং কখন ডাক্তারের সাথে পরামর্শ করতে হবে।" },
  { _id: "g4", category: "fever", titleBangla: "টাইফয়েড জ্বর: লক্ষণ ও প্রতিরোধ", descriptionBangla: "টাইফয়েডের প্রাথমিক লক্ষণগুলি সনাক্ত করুন এবং সংক্রমণ এড়াতে পরিচ্ছন্নতার নিয়মাবলী অনুসরণ করুন।" },

  // Respiratory
  { _id: "g2", category: "respiratory", titleBangla: "ঠান্ডা ও কাশির ঘরোয়া প্রতিকার", descriptionBangla: "শুকনো কাশি এবং কফ-যুক্ত কাশির জন্য মধু, আদা ও গরম পানির মতো প্রাকৃতিক সমাধান।" },
  { _id: "g5", category: "respiratory", titleBangla: "অ্যাজমা অ্যাটাক ম্যানেজমেন্ট", descriptionBangla: "অ্যাজমা বা হাঁপানির সময় কী করবেন এবং কখন জরুরি সহায়তা চাইবেন।" },

  // Digestive
  { _id: "g3", category: "digestive", titleBangla: "ডায়রিয়া: কারণ ও জরুরি পদক্ষেপ", descriptionBangla: "ডায়রিয়ার কারণ, দ্রুত পানিশূন্যতা রোধ এবং কখন ডাক্তার দেখাবেন তা জানুন।" },

  // Maternal
  { _id: "g6", category: "maternal", titleBangla: "গর্ভাবস্থায় প্রয়োজনীয় পুষ্টি", descriptionBangla: "গর্ভবতী মহিলাদের জন্য ক্যালসিয়াম, আয়রন এবং ফলিক এসিড সমৃদ্ধ খাদ্য তালিকা।" },
];

const apiClient = {
  get: (url) => {
    return new Promise(resolve => {
      setTimeout(() => { // Simulate network latency
        if (url === "/symptom-guide/categories") {
          resolve({ data: { categories: MOCK_CATEGORIES } });
        } else if (url.startsWith("/symptom-guide/category/")) {
          const categoryId = url.split('/').pop();
          const filteredGuides = MOCK_GUIDES.filter(g => g.category === categoryId);
          resolve({ data: { guides: filteredGuides } });
        } else if (url.startsWith("/symptom-guide/search?q=")) {
          const query = decodeURIComponent(url.split('q=')[1].toLowerCase());
          const searchResults = MOCK_GUIDES.filter(g =>
            g.titleBangla.toLowerCase().includes(query) ||
            g.descriptionBangla.toLowerCase().includes(query)
          );
          resolve({ data: { results: searchResults } });
        } else {
          resolve({ data: { guides: [] } });
        }
      }, 500);
    });
  },
};
// --- END MOCK API CLIENT ---


const Mission6 = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [guides, setGuides] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetches all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get("/symptom-guide/categories");
        setCategories(res.data.categories);
      } catch (err) {
        setError(err.response?.data?.message || "❌ ক্যাটেগরি লোড করতে ব্যর্থ।");
      }
    };
    fetchCategories();
  }, []);

  // Fetch guides by category
  const fetchGuidesByCategory = useCallback(async (categoryId) => {
    try {
      setLoading(true);
      setError("");
      const res = await apiClient.get(`/symptom-guide/category/${categoryId}`);
      setGuides(res.data.guides);
      setSearchQuery(""); // Clear search bar when filtering by category
    } catch (err) {
      setError(err.response?.data?.message || "❌ নির্দেশিকা লোড করতে ব্যর্থ।");
    } finally {
      setLoading(false);
    }
  }, []);

  // Search guides by keyword
  const searchGuides = useCallback(async () => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      setError("");
      const res = await apiClient.get(`/symptom-guide/search?q=${encodeURIComponent(searchQuery)}`);
      setGuides(res.data.results);
      setSelectedCategory(null); // Deselect category when searching
    } catch (err) {
      setError(err.response?.data?.message || "❌ সার্চ ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Handle category button click
  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null); // Deselect if already selected
      setGuides([]); // Clear results
    } else {
      setSelectedCategory(categoryId);
      fetchGuidesByCategory(categoryId);
    }
  };

  // Run search when pressing Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      searchGuides();
    }
  };

  // --- Main Component Render ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-10 font-sans">
      <div className="max-w-4xl w-full mx-auto bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 space-y-8">

        {/* Main Title */}
        <div className="flex items-center justify-center mb-6 border-b border-indigo-300 dark:border-indigo-700 pb-4">
          <BookOpen className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mr-3" />
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Mission 6: স্বাস্থ্য সচেতনতা নির্দেশিকা
          </h2>
        </div>

        {/* --- Search Section --- */}
        <div className="p-5 bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-600">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <Search className="w-4 h-4 mr-1" /> লক্ষণ বা রোগের নাম দিয়ে খুঁজুন
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="যেমন: জ্বর, ডায়রিয়া, কাশি..."
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={searchGuides}
              disabled={!searchQuery.trim()}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition duration-150 shadow-md"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- Category Filters --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
            <ListFilter className="w-5 h-5 mr-2 text-indigo-500" /> অথবা ক্যাটেগরি নির্বাচন করুন
          </h3>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-4 py-2 rounded-full border-2 font-medium text-sm transition duration-200 shadow-sm
                            ${selectedCategory === cat.id
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-300/50 dark:bg-indigo-700 dark:border-indigo-700"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-gray-600"
                  }`}
              >
                <Tag className="w-4 h-4 inline mr-1" />
                {cat.nameBangla}
              </button>
            ))}
          </div>
        </div>


        {/* --- Results Section --- */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 flex items-center">
            <Zap className="w-6 h-6 mr-2 text-indigo-500" />
            {loading ? "অনুসন্ধান চলছে..." : "প্রাপ্ত নির্দেশিকা"}
          </h3>

          {/* Loading/Error */}
          {loading && (
            <div className="text-center py-6">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              <p className="text-gray-600 dark:text-gray-400 mt-2">তথ্য লোড হচ্ছে...</p>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />{error}
            </div>
          )}

          {/* Guides List */}
          {!loading && guides.length > 0 && (
            <div className="space-y-4">
              {guides.map((guide) => (
                <div
                  key={guide._id}
                  className="p-5 border border-indigo-200 dark:border-indigo-800 rounded-xl bg-indigo-50 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-gray-600 transition duration-150 shadow-md"
                >
                  <h3 className="font-extrabold text-xl text-indigo-700 dark:text-indigo-300 mb-1">{guide.titleBangla}</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-base">{guide.descriptionBangla}</p>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && !error && guides.length === 0 && (selectedCategory || searchQuery.trim()) && (
            <div className="p-6 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-700 rounded-xl text-center text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
              <p className="font-semibold">দুঃখিত, আপনার অনুসন্ধানের সাথে মেলে এমন কোনো নির্দেশিকা পাওয়া যায়নি।</p>
            </div>
          )}

          {/* Initial State Message */}
          {!loading && !error && guides.length === 0 && !selectedCategory && !searchQuery.trim() && (
            <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-xl text-center text-gray-600 dark:text-gray-400">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
              <p>অনুসন্ধান শুরু করতে উপরে একটি ক্যাটেগরি নির্বাচন করুন বা সার্চ বারে টাইপ করুন।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mission6;
