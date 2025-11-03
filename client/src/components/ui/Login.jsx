import React, { useState } from "react";
import apiClient from "../../lib/api";

const Login = ({ onSwitchToSignUp, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });

      const userData = response.data.user;
      onLoginSuccess(userData);
      setMessage("লগইন সফল হয়েছে!");
    } catch (error) {
      console.error("Error logging in:", error);
      setMessage(error.response?.data?.message || "লগইন ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
        আবার স্বাগতম
      </h2>
      <p className="text-sm text-gray-500 text-center">
        আপনার একাউন্টে লগইন করুন চালিয়ে যেতে
      </p>

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
        onClick={handleLogin}
        className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition"
      >
        লগইন
      </button>

      {message && (
        <p className="text-center text-sm text-emerald-600 font-medium">
          {message}
        </p>
      )}

      <p className="text-center text-sm text-gray-500">
        আপনার কোনো একাউন্ট নেই?{" "}
        <button
          onClick={onSwitchToSignUp}
          className="text-emerald-600 hover:underline font-medium"
        >
          সাইন আপ করুন
        </button>
      </p>
    </div>
  );
};

export default Login;
