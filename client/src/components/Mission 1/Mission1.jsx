import {
  Frown,
  HeartHandshake,
  Laugh,
  Loader2,
  Meh,
  MessageSquare,
  Send,
  Smile,
  SmilePlus,
  User,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import apiClient from "../../lib/api";

const Mission1 = () => {
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        const response = await apiClient.get("/mood/greeting");
        setGreeting(response.data.message);
      } catch (err) {
        console.error("Greeting fetch error:", err);
      }
    };
    fetchGreeting();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setAiPrompt("");

    if (!mood) {
      return setMessage("অনুগ্রহ করে আপনার মুড নির্বাচন করুন।");
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.id) {
      return setMessage("User ID not found. Please login again.");
    }

    try {
      setLoading(true);

      const response = await apiClient.post("/mood/checkin", {
        mood_level: mood,
        note,
        userId: user.id,
      });

      setMessage(response.data.message);
      setAiPrompt(response.data.aiPrompt);
      setMood(null);
      setNote("");
    } catch (err) {
      console.error("Mood submit error:", err);
      const errMsg =
        err.response?.data?.message || "❌ সার্ভার ত্রুটি ঘটেছে। আবার চেষ্টা করুন।";
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const moodOptions = [
    { value: 1, label: "খুব খারাপ", icon: Frown, color: "text-red-500" },
    { value: 2, label: "খারাপ", icon: Meh, color: "text-orange-500" },
    { value: 3, label: "সাধারণ", icon: Smile, color: "text-yellow-500" },
    { value: 4, label: "ভালো", icon: SmilePlus, color: "text-emerald-500" },
    { value: 5, label: "খুব ভালো", icon: Laugh, color: "text-green-500" },
  ];

  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name || "ইউজার";

  return (
    <div className="w-100vw h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      {/* Card takes 40% of screen width */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 mx-auto">
        <div className="flex items-center justify-center mb-6">
          <HeartHandshake className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mr-3" />
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            🧘 মানসিক স্বাস্থ্য চেক-ইন
          </h2>
        </div>

        {/* Greeting and User Info */}
        <div className="bg-emerald-50 dark:bg-emerald-900/40 p-3 rounded-xl mb-6 flex items-center shadow-inner">
          <User className="w-5 h-5 text-emerald-700 dark:text-emerald-300 mr-3" />
          <p className="text-emerald-700 dark:text-emerald-300 font-medium">
            {userName}, {greeting || "স্বাগতম! আজ কেমন আছেন?"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mood Selection */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <label className="block text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              আজ আপনি কেমন বোধ করছেন?
            </label>
            <div className="flex justify-between gap-2">
              {moodOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = mood === option.value;
                return (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => setMood(option.value)}
                    className={`flex flex-col items-center justify-center w-1/5 p-2 rounded-xl text-sm font-medium transition-all duration-300 border-2 ${isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-lg"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-emerald-50 dark:hover:bg-gray-600"
                      }`}
                  >
                    <Icon
                      className={`w-6 h-6 mb-1 ${isSelected ? "text-white" : option.color
                        }`}
                    />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="flex items-center font-semibold mb-2 text-gray-800 dark:text-gray-200">
              <MessageSquare className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
              যদি কিছু বলতে চান (ঐচ্ছিক):
            </label>
            <textarea
              className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
              rows="3"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="যেমন: আজ একটু ক্লান্ত লাগছে, অথবা আজকের দিনটি খুবই চমৎকার ছিল..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !mood}
            className="w-full h-12 bg-emerald-600 text-white py-2 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-emerald-500/30"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> জমা হচ্ছে...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                মুড চেক-ইন জমা দিন
              </>
            )}
          </button>
        </form>

        {/* Message Area */}
        {message && (
          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-600 rounded-xl text-emerald-800 dark:text-emerald-200 text-center font-medium shadow-md">
            {message}
          </div>
        )}

        {/* AI Prompt Area */}
        {aiPrompt && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-600 rounded-xl text-blue-800 dark:text-blue-200 shadow-md">
            <div className="flex items-start">
              <Zap className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
              <div>
                <strong className="text-lg text-blue-900 dark:text-blue-100">
                  AI বার্তা:
                </strong>
                <p className="mt-1 text-sm">{aiPrompt}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mission1;
