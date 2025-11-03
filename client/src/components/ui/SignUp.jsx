import React, { useState } from "react";
import apiClient from "../../lib/api";

const SignUp = ({ onSwitchToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setMessage("সবগুলো ঘর পূরণ করতে হবে");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await apiClient.post("/auth/signup", {
        name,
        email,
        password,
      });

      setMessage(response.data.message || "সফলভাবে নিবন্ধন সম্পন্ন হয়েছে");
      console.log("✅ সাইন আপ সফল:", response.data);

      localStorage.setItem("token", response.data.token);
    } catch (error) {
      console.error("❌ সাইন আপে ত্রুটি:", error);
      setMessage(
        error.response?.data?.message || "সাইন আপ ব্যর্থ হয়েছে"
      );
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

      <input
        type="text"
        placeholder="পূর্ণ নাম"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded-lg bg-white placeholder-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <input
        type="email"
        placeholder="ইমেইল"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded-lg bg-white placeholder-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <input
        type="password"
        placeholder="পাসওয়ার্ড"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded-lg bg-white placeholder-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

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
