"use client";

import React, { useState } from "react";
import { ArrowRight, LogIn, UserPlus } from "lucide-react"; // Used specific icons
import Login from "./Login";
import SignUp from "./SignUp";
import Modal from "./Modal";

// Note: In a professional app, you'd pass setShowLogin/setShowSignUp via context/props
// to avoid duplicating the Modal/Login/Signup logic here if it's already in Navbar.

const CTA = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  // You need handleLoginSuccess if Login modal is used here to manage state
  const handleLoginSuccess = () => {
      // Logic to handle successful login (e.g., setting user in context/local storage)
      setShowLogin(false);
  };

  return (
    <section className="bg-emerald-600 dark:bg-emerald-700 py-24 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto text-center text-white">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight">
          স্বাস্থ্য নেভিগেশন <span className="text-emerald-200 dark:text-emerald-300">আজই শুরু করুন!</span>
        </h2>
        <p className="mb-12 text-xl sm:text-2xl font-light max-w-3xl mx-auto">
          স্বাস্থ্য নেভিগেশনকে সহজ, দ্রুত এবং বন্ধুত্বপূর্ণ করে তুলুন। আমাদের কমিউনিটি এবং রিসোর্স আপনাকে সহায়তা করবে প্রতিটি ধাপে।
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button
            onClick={() => setShowSignUp(true)}
            // Primary CTA button design: High contrast, strong shadow, interactive
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-600 font-bold text-lg rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-2xl shadow-emerald-900/40 transform hover:scale-[1.05]"
          >
            <UserPlus className="w-5 h-5 mr-3" />
            এখন সাইন আপ করুন
          </button>

          <button
            onClick={() => setShowLogin(true)}
            // Secondary CTA button design: Bordered, inverse hover
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-bold text-lg rounded-xl hover:bg-white hover:text-emerald-600 transition-all duration-300 transform hover:scale-[1.05]"
          >
            <LogIn className="w-5 h-5 mr-3" />
            লগইন করুন
          </button>
        </div>
      </div>

      {/* Modals (kept here for functionality, but centralization is preferred) */}
      <Modal isOpen={showLogin} onClose={() => setShowLogin(false)}>
        <Login
          onSwitchToSignUp={() => {
            setShowLogin(false);
            setShowSignUp(true);
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      </Modal>

      <Modal isOpen={showSignUp} onClose={() => setShowSignUp(false)}>
        <SignUp
          onSwitchToLogin={() => {
            setShowSignUp(false);
            setShowLogin(true);
          }}
        />
      </Modal>
    </section>
  );
};

export default CTA;