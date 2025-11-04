import {
  AlertTriangle,
  Calendar,
  Clock,
  HeartPulse,
  ListFilter,
  Loader2,
  MapPin,
  Search,
  Tag,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// --- MOCK API DATA & CONSTANTS ---
const EVENT_TYPES = [
  { id: "Vaccination Camp", nameBangla: "টিকাদান ক্যাম্প" },
  { id: "Health Screening", nameBangla: "স্বাস্থ্য স্ক্রিনিং" },
  { id: "Seminar", nameBangla: "সেমিনার" },
];

const MOCK_EVENTS = [
  { _id: "e1", titleBangla: "শিশু টিকাদান ক্যাম্প", descriptionBangla: "সকল শিশুর জন্য বিনামূল্যে পোলিও ও হামের টিকা প্রদান করা হবে।", eventType: "Vaccination Camp", upazila: "মিঠাপুকুর", status: "upcoming", startDate: "2025-11-15T10:00:00.000Z" },
  { _id: "e2", titleBangla: "মাতৃস্বাস্থ্য সচেতনতা সেমিনার", descriptionBangla: "গর্ভবতী মায়েদের জন্য স্বাস্থ্যকর জীবনধারা এবং পুষ্টি নিয়ে আলোচনা।", eventType: "Seminar", upazila: "পীরগঞ্জ", status: "ongoing", startDate: "2025-11-04T14:00:00.000Z" },
  { _id: "e3", titleBangla: "বিনামূল্যে স্বাস্থ্য স্ক্রিনিং", descriptionBangla: "ডায়াবেটিস ও রক্তচাপ পরীক্ষার জন্য বিনামূল্যে স্ক্রিনিং সুযোগ।", eventType: "Health Screening", upazila: "কাউনিয়া", status: "completed", startDate: "2025-10-20T09:00:00.000Z" },
  { _id: "e4", titleBangla: "মশা তাড়ানোর কর্মশালা", descriptionBangla: "ডেঙ্গু ও ম্যালেরিয়া প্রতিরোধের জন্য স্থানীয় স্বাস্থ্য কর্মীদের কর্মশালা।", eventType: "Seminar", upazila: "মিঠাপুকুর", status: "upcoming", startDate: "2025-11-28T11:00:00.000Z" },
  { _id: "e5", titleBangla: "বয়স্কদের চক্ষু পরীক্ষা শিবির", descriptionBangla: "বয়স্ক নাগরিকদের জন্য বিনামূল্যে চক্ষু পরীক্ষা এবং ছানি অপারেশন পরামর্শ।", eventType: "Health Screening", upazila: "পীরগঞ্জ", status: "cancelled", startDate: "2025-12-10T10:00:00.000Z" },
];

// --- MOCK API CLIENT IMPLEMENTATION ---
const apiClient = {
  get: (url) => {
    return new Promise(resolve => {
      setTimeout(() => { // Simulate network latency
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const filters = {
          eventType: urlParams.get('eventType') || '',
          upazila: urlParams.get('upazila')?.toLowerCase() || '',
          status: urlParams.get('status') || '',
        };

        let filteredEvents = MOCK_EVENTS.filter(event => {
          const matchType = !filters.eventType || event.eventType === filters.eventType;
          const matchUpazila = !filters.upazila || event.upazila.toLowerCase().includes(filters.upazila);
          const matchStatus = !filters.status || event.status === filters.status;
          return matchType && matchUpazila && matchStatus;
        });

        resolve({ data: { events: filteredEvents } });
      }, 700);
    });
  },
};
// --- END MOCK API CLIENT ---


const Mission7 = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ eventType: "", upazila: "", status: "" });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      // Construct query string from current filters state
      const query = new URLSearchParams(filters).toString();
      const res = await apiClient.get(`/health-events?${query}`);
      setEvents(res.data.events);
    } catch (err) {
      // In a real app, err.response may be undefined in the mock
      setError("❌ ইভেন্ট লোড করতে ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  }, [filters]); // Recalculate fetchEvents whenever filters change

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]); // Trigger fetch when the fetch function changes (which happens when filters change)

  // Helper to get status color
  const getStatusClasses = (status) => {
    switch (status) {
      case 'upcoming':
        return 'text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'ongoing':
        return 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300 animate-pulse';
      case 'completed':
        return 'text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      case 'cancelled':
        return 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  // Helper to format status text in Bengali
  const formatStatus = (status) => {
    switch (status) {
      case 'upcoming': return 'আসন্ন';
      case 'ongoing': return 'চলমান';
      case 'completed': return 'সম্পন্ন';
      case 'cancelled': return 'বাতিল';
      default: return 'অজানা';
    }
  };


  // --- Main Component Render ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-10 font-sans">
      <div className="max-w-5xl w-full mx-auto bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 space-y-8">

        {/* Main Title */}
        <div className="flex items-center justify-center border-b border-purple-300 dark:border-purple-700 pb-4">
          <HeartPulse className="w-10 h-10 text-purple-600 dark:text-purple-400 mr-3" />
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Mission 7: স্বাস্থ্য ইভেন্ট অনুসন্ধান
          </h2>
        </div>

        {/* --- Filters Section --- */}
        <div className="p-5 bg-purple-50 dark:bg-gray-700 rounded-2xl shadow-lg border border-purple-200 dark:border-purple-800">
          <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4 flex items-center">
            <ListFilter className="w-5 h-5 mr-2" /> ইভেন্ট ফিল্টার করুন
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Event Type Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"><Tag className="w-3 h-3 mr-1 text-purple-500" /> ইভেন্টের প্রকার</label>
              <select
                className="p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                value={filters.eventType}
                onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
              >
                <option value="">সকল প্রকার</option>
                {EVENT_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.nameBangla}</option>
                ))}
              </select>
            </div>

            {/* Upazila Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"><MapPin className="w-3 h-3 mr-1 text-purple-500" /> উপজেলা</label>
              <input
                type="text"
                placeholder="উপজেলা লিখুন..."
                className="p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                value={filters.upazila}
                onChange={(e) => setFilters({ ...filters, upazila: e.target.value })}
              />
            </div>

            {/* Status Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"><Clock className="w-3 h-3 mr-1 text-purple-500" /> অবস্থা</label>
              <select
                className="p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">সকল অবস্থা</option>
                <option value="upcoming">আসন্ন</option>
                <option value="ongoing">চলমান</option>
                <option value="completed">সম্পন্ন</option>
                <option value="cancelled">বাতিল</option>
              </select>
            </div>

            {/* Apply/Reset Button (Using fetchEvents due to the useEffect structure) */}
            <div className="flex flex-col justify-end">
              <button
                onClick={() => setFilters({ eventType: "", upazila: "", status: "" })}
                className="w-full px-4 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition duration-150 shadow-md"
              >
                <Search className="w-5 h-5 inline mr-1" /> ফিল্টার মুছুন
              </button>
            </div>

          </div>
        </div>

        {/* --- Results Section --- */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-purple-500" />
            {loading ? "ইভেন্ট লোড হচ্ছে..." : `প্রাপ্ত ইভেন্ট (${events.length})`}
          </h3>

          {/* Loading / Error */}
          {loading && (
            <div className="text-center py-6">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
              <p className="text-gray-600 dark:text-gray-400 mt-2">ইভেন্ট লোড হচ্ছে...</p>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />{error}
            </div>
          )}

          {/* Events List */}
          {!loading && events.length > 0 && (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="p-5 border border-purple-200 dark:border-purple-800 rounded-xl bg-white dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-gray-600 transition duration-150 shadow-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-extrabold text-xl text-purple-700 dark:text-purple-300">{event.titleBangla}</h3>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ml-4 ${getStatusClasses(event.status)}`}>
                      {formatStatus(event.status)}
                    </span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-2">{event.descriptionBangla}</p>

                  <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mt-3 space-x-4">
                    <p className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(event.startDate).toLocaleDateString("bn-BD")}
                    </p>
                    <p className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {event.upazila}
                    </p>
                    <p className="flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      {event.eventType}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && !error && events.length === 0 && (
            <div className="p-6 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-700 rounded-xl text-center text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
              <p className="font-semibold">দুঃখিত, এই ফিল্টারগুলির সাথে মেলে এমন কোনো ইভেন্ট পাওয়া যায়নি।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mission7;
