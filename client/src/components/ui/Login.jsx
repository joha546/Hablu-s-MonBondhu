import { useState } from "react";
import apiClient from "../../lib/api";

const Login = ({ onSwitchToSignUp, onLoginSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const response = await apiClient.post("/auth/login", {
        phoneNumber,
        password,
      });

      const { user, token } = response.data; // backend should send { user, token }

      // ✅ Save user & token to localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      localStorage.setItem("isLoggedIn", "true");

      // ✅ Notify other components (like Sidebar)
      window.dispatchEvent(new Event("userLogin"));

      // ✅ Callback for parent (optional)
      if (onLoginSuccess) onLoginSuccess(user);

      setMessage("লগইন সফল হয়েছে!");
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.response?.data?.message || "লগইন ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="flex flex-col space-y-4 bg-white p-6 rounded-lg shadow-md w-full max-w-sm mx-auto">
      <h2 className="text-2xl font-semibold text-center text-gray-800">স্বাগতম</h2>

      <input
        type="text"
        placeholder="ফোন নাম্বার"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      <input
        type="password"
        placeholder="পাসওয়ার্ড"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      <button
        onClick={handleLogin}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-colors"
      >
        লগইন
      </button>

      {message && <p className="text-center text-sm text-emerald-600">{message}</p>}

      <p className="text-center text-sm text-gray-500">
        একাউন্ট নেই?{" "}
        <button
          onClick={onSwitchToSignUp}
          className="text-emerald-600 hover:underline"
        >
          সাইন আপ করুন
        </button>
      </p>
    </div>
  );
};

export default Login;
