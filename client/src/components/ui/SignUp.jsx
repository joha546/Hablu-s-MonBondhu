import React, { useState } from "react";
import apiClient from "../../lib/api";

const SignUp = ({ onSwitchToLogin }) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [nid, setNid] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !age || !nid || !phoneNumber || !password) {
      setMessage("সবগুলো ঘর পূরণ করতে হবে");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await apiClient.post("/auth/register", {
        name,
        age: Number(age),
        nid,
        phoneNumber,
        password,
      });

      setMessage(response.data.message || "সফলভাবে নিবন্ধন সম্পন্ন হয়েছে");
      console.log("✅ সাইন আপ সফল:", response.data);
    } catch (error) {
      console.error("❌ সাইন আপে ত্রুটি:", error);
      setMessage(error.response?.data?.message || "সাইন আপ ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
        একাউন্ট তৈরি করুন
      </h2>
      <p className="text-sm text-gray-500 text-center">
        আজই আমাদের সাথে যোগ দিন! মাত্র এক মিনিট সময় লাগবে।
      </p>

      <div className="flex flex-col space-y-1">
        <label className="text-gray-700 dark:text-gray-200 text-sm font-medium">
          পূর্ণ নাম
        </label>
        <input
          type="text"
          placeholder="যেমনঃ মাহরিনা রহমান"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-gray-700 dark:text-gray-200 text-sm font-medium">
          বয়স
        </label>
        <input
          type="number"
          placeholder="যেমনঃ ২৫"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full p-2 border rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-gray-700 dark:text-gray-200 text-sm font-medium">
          এনআইডি নাম্বার
        </label>
        <input
          type="text"
          placeholder="যেমনঃ 1234567890123"
          value={nid}
          onChange={(e) => setNid(e.target.value)}
          className="w-full p-2 border rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-gray-700 dark:text-gray-200 text-sm font-medium">
          ফোন নাম্বার
        </label>
        <input
          type="text"
          placeholder="+8801XXXXXXXXX"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full p-2 border rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-gray-700 dark:text-gray-200 text-sm font-medium">
          পাসওয়ার্ড
        </label>
        <input
          type="password"
          placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <button
        onClick={handleSignUp}
        disabled={loading}
        className={`w-full bg-emerald-600 text-white py-2 rounded-lg transition ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"
        }`}
      >
        {loading ? "সাইন আপ হচ্ছে..." : "সাইন আপ"}
      </button>

      {message && (
        <p
          className={`text-center text-sm font-medium ${
            message.includes("সফল") ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <p className="text-center text-sm text-gray-500">
        ইতিমধ্যে একটি একাউন্ট আছে?{" "}
        <button
          onClick={onSwitchToLogin}
          className="text-emerald-600 hover:underline font-medium"
        >
          লগইন করুন
        </button>
      </p>
    </div>
  );
};

export default SignUp;
