import {
  AlertTriangle,
  Baby,
  Calendar,
  Heart,
  Loader2,
  Shield,
  Stethoscope,
  Syringe,
  User,
  Weight,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// --- MOCK API CLIENT IMPLEMENTATION ---
// Simulating API responses for Maternal and Child Health data.

const MOCK_MATERNAL_RECORD = {
  id: "MATERNAL_RECORD_ID",
  lmp: "2024-03-15T00:00:00.000Z", // Last Menstrual Period
  edd: "2024-12-20T00:00:00.000Z", // Expected Delivery Date (40 weeks later)
  gravida: 2, // Total pregnancies
  para: 1, // Deliveries past 20 weeks
  risk: "Low Risk",
};

const MOCK_ANC_VISITS = [
  { visitNumber: 2, scheduledDate: "2024-08-02T00:00:00.000Z", status: "Upcoming" },
  { visitNumber: 3, scheduledDate: "2024-10-15T00:00:00.000Z", status: "Upcoming" },
  { visitNumber: 4, scheduledDate: "2024-12-01T00:00:00.000Z", status: "Upcoming" },
];

const MOCK_CHILD_RECORD = {
  id: "CHILD_RECORD_ID",
  name: "আবির হোসাইন", // Abir Hossain
  sex: "Male",
  birthDate: "2023-01-20T00:00:00.000Z",
  birthWeight: 3.2,
};

const MOCK_VACCINATIONS = [
  { _id: "v1", name: "DPT-Hib-HepB-IPV (10 সপ্তাহ)", scheduledDate: "2023-04-01T00:00:00.000Z" },
  { _id: "v2", name: "PCV (14 সপ্তাহ)", scheduledDate: "2023-05-01T00:00:00.000Z" },
  { _id: "v3", name: "Measles (9 মাস)", scheduledDate: "2023-10-20T00:00:00.000Z" },
];


const apiClient = {
  get: (url) => {
    return new Promise(resolve => {
      setTimeout(() => { // Simulate network latency
        if (url.includes("/maternal-child-health/maternal/")) {
          if (url.includes("/anc-visits")) {
            resolve({ data: { upcomingVisits: MOCK_ANC_VISITS } });
          } else {
            resolve({ data: MOCK_MATERNAL_RECORD });
          }
        } else if (url.includes("/maternal-child-health/child/")) {
          if (url.includes("/vaccinations")) {
            resolve({ data: { upcomingVaccinations: MOCK_VACCINATIONS } });
          } else {
            resolve({ data: MOCK_CHILD_RECORD });
          }
        } else {
          resolve({ data: null });
        }
      }, 700);
    });
  },
};
// --- END MOCK API CLIENT ---


const Mission5 = () => {
  const [maternalRecord, setMaternalRecord] = useState(null);
  const [childRecord, setChildRecord] = useState(null);
  const [ancVisits, setAncVisits] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Memoized IDs for the demo
  const sampleMaternalId = "MATERNAL_RECORD_ID";
  const sampleChildId = "CHILD_RECORD_ID";

  // Fetch maternal record by ID
  const fetchMaternalRecord = useCallback(async (id) => {
    try {
      setLoading(true);
      setError("");
      const res = await apiClient.get(`/maternal-child-health/maternal/${id}`);
      setMaternalRecord(res.data);

      const ancRes = await apiClient.get(`/maternal-child-health/maternal/${id}/anc-visits`);
      setAncVisits(ancRes.data.upcomingVisits);
    } catch (err) {
      setError(err.response?.data?.message || "❌ মাতৃত্বকালীন রেকর্ড লোড করতে ব্যর্থ।");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch child record by ID
  const fetchChildRecord = useCallback(async (id) => {
    try {
      setLoading(true);
      setError("");
      const res = await apiClient.get(`/maternal-child-health/child/${id}`);
      setChildRecord(res.data);

      const vacRes = await apiClient.get(`/maternal-child-health/child/${id}/vaccinations`);
      setVaccinations(vacRes.data.upcomingVaccinations);
    } catch (err) {
      setError(err.response?.data?.message || "❌ শিশুর রেকর্ড লোড করতে ব্যর্থ।");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchMaternalRecord(sampleMaternalId);
    fetchChildRecord(sampleChildId);
  }, [fetchMaternalRecord, fetchChildRecord]);


  // --- Helper UI Components ---

  const InfoCard = ({ icon, title, children, colorClass }) => (
    <div className={`p-6 ${colorClass} rounded-2xl shadow-lg transition duration-300 hover:shadow-xl space-y-3`}>
      <h3 className="font-bold text-xl mb-3 flex items-center border-b pb-2 border-opacity-30">
        {icon}
        {title}
      </h3>
      <div className="space-y-2 text-sm">
        {children}
      </div>
    </div>
  );

  const ListItem = ({ icon, label, value }) => (
    <p className="flex justify-between items-center py-1 border-b border-opacity-10 last:border-b-0">
      <span className="flex items-center font-medium text-gray-700 dark:text-gray-300">
        {icon}
        {label}
      </span>
      <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
    </p>
  );

  // --- Main Component Render ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-10 font-sans">
      <div className="max-w-5xl w-full mx-auto bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 space-y-10">

        {/* Main Title */}
        <div className="flex items-center justify-center mb-6 border-b border-gray-300 dark:border-gray-700 pb-4">
          <Stethoscope className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mr-3" />
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Mission 5: মা ও শিশু স্বাস্থ্য রেকর্ড
          </h2>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto" />
            <p className="text-gray-600 dark:text-gray-400 mt-3 font-medium">তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />{error}
          </div>
        )}

        {/* --- Records Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* --- Maternal Health Section (Emerald/Green) --- */}
          {maternalRecord && (
            <div className="space-y-8">
              <InfoCard
                icon={<Heart className="w-6 h-6 mr-3 text-emerald-600 dark:text-emerald-400" />}
                title="মাতৃত্বকালীন রেকর্ড"
                colorClass="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200"
              >
                <ListItem
                  icon={<Calendar className="w-4 h-4 mr-2 text-emerald-500" />}
                  label="শেষ মাসিকের তারিখ (LMP)"
                  value={new Date(maternalRecord.lmp).toLocaleDateString("bn-BD")}
                />
                <ListItem
                  icon={<Calendar className="w-4 h-4 mr-2 text-emerald-500" />}
                  label="প্রত্যাশিত প্রসবের তারিখ (EDD)"
                  value={new Date(maternalRecord.edd).toLocaleDateString("bn-BD")}
                />
                <ListItem
                  icon={<User className="w-4 h-4 mr-2 text-emerald-500" />}
                  label="মোট গর্ভধারণ সংখ্যা (Gravida)"
                  value={maternalRecord.gravida}
                />
                <ListItem
                  icon={<User className="w-4 h-4 mr-2 text-emerald-500" />}
                  label="সন্তান জন্মদানের সংখ্যা (Para)"
                  value={maternalRecord.para}
                />
                <ListItem
                  icon={<Shield className="w-4 h-4 mr-2 text-emerald-500" />}
                  label="ঝুঁকির অবস্থা"
                  value={maternalRecord.risk}
                />
              </InfoCard>

              {/* ANC Visits */}
              {ancVisits.length > 0 && (
                <InfoCard
                  icon={<Stethoscope className="w-6 h-6 mr-3 text-emerald-600 dark:text-emerald-400" />}
                  title="আসন্ন এএনসি ভিজিট"
                  colorClass="bg-white dark:bg-gray-700 border border-emerald-200 dark:border-emerald-700 text-gray-800 dark:text-gray-100"
                >
                  <ul className="space-y-3">
                    {ancVisits.map((visit, index) => (
                      <li key={index} className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-800 rounded-lg">
                        <span className="font-semibold">ভিজিট #{visit.visitNumber}</span>
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-200">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {new Date(visit.scheduledDate).toLocaleDateString("bn-BD")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </InfoCard>
              )}
            </div>
          )}


          {/* --- Child Health Section (Blue/Sky) --- */}
          {childRecord && (
            <div className="space-y-8">
              <InfoCard
                icon={<Baby className="w-6 h-6 mr-3 text-sky-600 dark:text-sky-400" />}
                title="শিশুর রেকর্ড"
                colorClass="bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-700 text-sky-800 dark:text-sky-200"
              >
                <ListItem
                  icon={<User className="w-4 h-4 mr-2 text-sky-500" />}
                  label="নাম"
                  value={childRecord.name}
                />
                <ListItem
                  icon={<User className="w-4 h-4 mr-2 text-sky-500" />}
                  label="লিঙ্গ"
                  value={childRecord.sex === 'Male' ? 'ছেলে' : 'মেয়ে'}
                />
                <ListItem
                  icon={<Calendar className="w-4 h-4 mr-2 text-sky-500" />}
                  label="জন্ম তারিখ"
                  value={new Date(childRecord.birthDate).toLocaleDateString("bn-BD")}
                />
                <ListItem
                  icon={<Weight className="w-4 h-4 mr-2 text-sky-500" />}
                  label="জন্মের সময় ওজন"
                  value={`${childRecord.birthWeight} কেজি`}
                />
              </InfoCard>

              {/* Vaccinations */}
              {vaccinations.length > 0 && (
                <InfoCard
                  icon={<Syringe className="w-6 h-6 mr-3 text-sky-600 dark:text-sky-400" />}
                  title="আসন্ন টিকা"
                  colorClass="bg-white dark:bg-gray-700 border border-sky-200 dark:border-sky-700 text-gray-800 dark:text-gray-100"
                >
                  <ul className="space-y-3">
                    {vaccinations.map(vac => (
                      <li key={vac._id} className="flex justify-between items-center p-3 bg-sky-50 dark:bg-sky-800 rounded-lg">
                        <span className="font-semibold">{vac.name}</span>
                        <span className="text-sm font-medium text-sky-700 dark:text-sky-200">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {new Date(vac.scheduledDate).toLocaleDateString("bn-BD")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </InfoCard>
              )}
            </div>
          )}

          {/* If no records are found */}
          {!loading && !maternalRecord && !childRecord && (
            <div className="lg:col-span-2 p-6 bg-gray-100 dark:bg-gray-700 rounded-xl text-center text-gray-600 dark:text-gray-400">
              <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-red-500" />
              <p className="font-semibold">কোনো রেকর্ড পাওয়া যায়নি। অনুগ্রহ করে নিশ্চিত করুন যে আপনি সঠিক আইডি ব্যবহার করছেন।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mission5;
