import React, { useEffect, useState } from "react";
import apiClient from "../../lib/api";

const Mission1 = () => {
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [greeting, setGreeting] = useState("");

  // 🔹 Fetch greeting
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

  // 🔹 Handle mood submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setAiPrompt("");

    if (!mood) {
      return setMessage("অনুগ্রহ করে আপনার মুড নির্বাচন করুন।");
    }

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.id) {
      return setMessage("User ID not found. Please login again.");
    }

    try {
      setLoading(true);

      const response = await apiClient.post("/mood/checkin", {
        mood_level: mood,
        note,
        userId: user.id, // send userId explicitly
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
    { value: 1, label: "😞 খুব খারাপ" },
    { value: 2, label: "😐 খারাপ" },
    { value: 3, label: "🙂 সাধারণ" },
    { value: 4, label: "😊 ভালো" },
    { value: 5, label: "😁 খুব ভালো" },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 max-w-lg mx-auto mt-6">
      <h2 className="text-2xl font-bold text-emerald-600 mb-2 text-center">
        🧘 মিশন ১: মানসিক স্বাস্থ্য চেক-ইন
      </h2>

      {greeting && (
        <p className="text-emerald-700 font-medium text-center mb-4">
          {greeting}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-2 text-gray-800">
            আজ আপনি কেমন বোধ করছেন?
          </label>
          <div className="flex justify-between">
            {moodOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => setMood(option.value)}
                className={`px-3 py-2 rounded-lg text-lg transition-all ${mood === option.value
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-gray-800">
            যদি কিছু বলতে চান (ঐচ্ছিক):
          </label>
          <textarea
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            rows="3"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="যেমন: আজ একটু ক্লান্ত লাগছে..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
        >
          {loading ? "জমা হচ্ছে..." : "✅ জমা দিন"}
        </button>
      </form>

      {message && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-center">
          {message}
        </div>
      )}

      {aiPrompt && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
          🤖 <strong>AI বার্তা:</strong> {aiPrompt}
        </div>
      )}
    </div>
  );
};

export default Mission1;
