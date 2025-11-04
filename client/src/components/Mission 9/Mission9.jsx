import { Activity, BarChart3, Loader2, Shield, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// --- MOCK API DATA ---
const MOCK_PREVALENCE_DATA = [
  { disease: "ডায়াবেটিস", cases: 1500, target: 1800, color: "#8884d8" },
  { disease: "উচ্চ রক্তচাপ", cases: 2100, target: 2500, color: "#82ca9d" },
  { disease: "টিবি", cases: 350, target: 400, color: "#ffc658" },
  { disease: "নিউমোনিয়া", cases: 700, target: 800, color: "#ff7300" },
];

const MOCK_VACCINATION_DATA = [
  { name: "পোলিও", coverage: 92, target: 95, color: "#0ea5e9" },
  { name: "হাম (Measles)", coverage: 85, target: 90, color: "#10b981" },
  { name: "ডিপথেরিয়া", coverage: 78, target: 85, color: "#ef4444" },
];

const MOCK_TREND_DATA = [
  { month: 'জানু', cases: 120 },
  { month: 'ফেব্রু', cases: 150 },
  { month: 'মার্চ', cases: 130 },
  { month: 'এপ্রিল', cases: 180 },
  { month: 'মে', cases: 220 },
  { month: 'জুন', cases: 190 },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0ea5e9'];
// --- END MOCK API DATA ---

// --- MOCK API CLIENT ---
const apiClient = {
  get: (url) => {
    return new Promise(resolve => {
      setTimeout(() => { // Simulate network latency
        if (url.includes("prevalence")) {
          resolve({ data: { data: MOCK_PREVALENCE_DATA } });
        } else if (url.includes("vaccination")) {
          resolve({ data: { data: MOCK_VACCINATION_DATA } });
        } else if (url.includes("trend")) {
          resolve({ data: { data: MOCK_TREND_DATA } });
        } else {
          resolve({ data: { data: [] } });
        }
      }, 800);
    });
  },
};
// --- END MOCK API CLIENT ---


// Card Component for consistent styling
const DashboardCard = ({ title, icon, children, className = "" }) => (
  <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 ${className}`}>
    <div className="flex items-center mb-4 border-b pb-2">
      {icon}
      <h3 className="text-xl font-bold text-gray-800 dark:text-white ml-2">{title}</h3>
    </div>
    <div className="h-72">
      {children}
    </div>
  </div>
);


const Mission9 = () => {
  const [prevalenceData, setPrevalenceData] = useState([]);
  const [vaccinationData, setVaccinationData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [prevalenceRes, vaccinationRes, trendRes] = await Promise.all([
        apiClient.get("/health-data/prevalence"),
        apiClient.get("/health-data/vaccination"),
        apiClient.get("/health-data/trend"),
      ]);
      setPrevalenceData(prevalenceRes.data.data);
      setVaccinationData(vaccinationRes.data.data);
      setTrendData(trendRes.data.data);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("❌ স্বাস্থ্য ডেটা লোড করতে ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalVaccinationCoverage = vaccinationData.reduce((acc, curr) => acc + curr.coverage, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-10 font-sans">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg font-medium">স্বাস্থ্য ডেটা বিশ্লেষণ চলছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl flex items-center">
        <AlertTriangle className="w-6 h-6 mr-3" />{error}
      </div>
    );
  }

  // --- Main Component Render ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-10 font-sans">
      <div className="max-w-6xl w-full mx-auto space-y-8">

        {/* Main Title */}
        <div className="flex items-center justify-center border-b border-indigo-300 dark:border-indigo-700 pb-4">
          <Activity className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mr-3" />
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Mission 9: স্বাস্থ্য ডেটা বিশ্লেষণ ড্যাশবোর্ড
          </h2>
        </div>

        {/* --- Grid of Charts --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">

          {/* 1. Disease Prevalence Bar Chart */}
          <DashboardCard
            title="রোগের প্রাদুর্ভাব বনাম লক্ষ্যমাত্রা"
            icon={<BarChart3 className="w-6 h-6 text-blue-500" />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prevalenceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="disease" stroke="#333" />
                <YAxis stroke="#333" />
                <Tooltip
                  formatter={(value, name, props) => [`${value} কেস`, name === 'cases' ? 'প্রকৃত কেস' : 'লক্ষ্যমাত্রা']}
                  labelFormatter={(label) => `রোগ: ${label}`}
                />
                <Legend />
                <Bar dataKey="cases" fill="#3b82f6" name="প্রকৃত কেস" radius={[5, 5, 0, 0]} />
                <Bar dataKey="target" fill="#a5b4fc" name="লক্ষ্যমাত্রা" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </DashboardCard>

          {/* 2. Vaccination Coverage Pie Chart */}
          <DashboardCard
            title="টিকাদান কভারেজ শতাংশ"
            icon={<Shield className="w-6 h-6 text-emerald-500" />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value, name, props) => [`${value}% কভারেজ`, props.payload.name]}
                  labelFormatter={(label) => `টিকা: ${label}`}
                />
                <Pie
                  data={vaccinationData}
                  dataKey="coverage"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {vaccinationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </DashboardCard>

          {/* 3. Monthly Case Trend Line Chart */}
          <DashboardCard
            title="মাসিক রোগের প্রবণতা"
            icon={<TrendingUp className="w-6 h-6 text-red-500" />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#333" />
                <YAxis stroke="#333" />
                <Tooltip
                  formatter={(value) => [`${value} কেস`, 'মোট কেস']}
                  labelFormatter={(label) => `মাস: ${label}`}
                />
                <Legend />
                <Line type="monotone" dataKey="cases" stroke="#ef4444" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} name="মোট কেস" />
              </LineChart>
            </ResponsiveContainer>
          </DashboardCard>

          {/* 4. Key Metric Summary (Full width on mobile/tablet) */}
          <div className="lg:col-span-2 xl:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl shadow-md border-b-4 border-indigo-500">
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">মোট রেকর্ডকৃত রোগ</p>
              <p className="text-3xl font-extrabold text-indigo-800 dark:text-indigo-200 mt-1">
                {prevalenceData.reduce((sum, item) => sum + item.cases, 0).toLocaleString('bn-BD')}
              </p>
            </div>
            <div className="p-6 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl shadow-md border-b-4 border-emerald-500">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">গড় টিকাদান কভারেজ</p>
              <p className="text-3xl font-extrabold text-emerald-800 dark:text-emerald-200 mt-1">
                {(totalVaccinationCoverage / vaccinationData.length).toFixed(1)}%
              </p>
            </div>
            <div className="p-6 bg-yellow-100 dark:bg-yellow-900/50 rounded-2xl shadow-md border-b-4 border-yellow-500">
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">মাসিক সর্বোচ্চ কেস</p>
              <p className="text-3xl font-extrabold text-yellow-800 dark:text-yellow-200 mt-1">
                {Math.max(...trendData.map(d => d.cases))}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Mission9;
