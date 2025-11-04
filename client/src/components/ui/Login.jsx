import React, { useState } from "react";
import apiClient from "../../lib/api";

const Login = ({ onSwitchToSignUp, onLoginSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const response = await apiClient.post("/auth/login", { phoneNumber, password });

      const { user, token } = response.data; // backend must send { user, token }

      // Save user & token in localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      onLoginSuccess(user); // parent component state
      setMessage("লগইন সফল হয়েছে!");
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.response?.data?.message || "লগইন ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-semibold text-center text-gray-800">স্বাগতম</h2>
      <input
        type="text"
        placeholder="ফোন নাম্বার"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        className="w-full p-2 border rounded-lg"
      />
      <input
        type="password"
        placeholder="পাসওয়ার্ড"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded-lg"
      />
      <button onClick={handleLogin} className="w-full bg-emerald-600 text-white py-2 rounded-lg">
        লগইন
      </button>
      {message && <p className="text-center text-sm text-emerald-600">{message}</p>}
      <p className="text-center text-sm text-gray-500">
        একাউন্ট নেই?{" "}
        <button onClick={onSwitchToSignUp} className="text-emerald-600 hover:underline">
          সাইন আপ করুন
        </button>
      </p>
    </div>
  );
};

export default Login;
