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
      setMessage("All fields are required");
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

      setMessage(response.data.message); // "User registered successfully"
      console.log("✅ Sign up successful:", response.data);

      // Optionally store token in localStorage
      localStorage.setItem("token", response.data.token);
    } catch (error) {
      console.error("❌ Error signing up:", error);
      setMessage(
        error.response?.data?.message || "Failed to sign up"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
        Create Account
      </h2>
      <p className="text-sm text-gray-500 text-center">
        Join us today! It only takes a minute.
      </p>

      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded-lg bg-white placeholder-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded-lg bg-white placeholder-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <input
        type="password"
        placeholder="Password"
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
        {loading ? "Signing up..." : "Sign Up"}
      </button>

      {message && (
        <p
          className={`text-center text-sm font-medium ${
            message.includes("success") ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <button
          onClick={onSwitchToLogin}
          className="text-emerald-600 hover:underline font-medium"
        >
          Log in
        </button>
      </p>
    </div>
  );
};

export default SignUp;
