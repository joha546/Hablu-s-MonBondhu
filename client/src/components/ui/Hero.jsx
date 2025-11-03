"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import Login from "./Login";
import SignUp from "./SignUp";
import Modal from "./Modal";

const Hero = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setShowLogin(false);
  };

  return (
    <section className="bg-gray-50 dark:bg-black flex flex-col items-center justify-center h-[92vh] text-center px-4">
      <div className="max-w-5xl mx-auto">
        {/* Top Badge / Mini info */}
        <div className="mb-6 flex justify-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 text-xs sm:text-sm font-medium hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors"
          >
            <span className="text-slate-600 dark:text-slate-300">
              হাবলু - কমিউনিটি হেলথ নেভিগেটর বাংলাদেশ (CNHRB™)
            </span>
            <ArrowRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </a>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl mb-6">
          হাবলু এখন{" "}
          <span className="text-emerald-600 dark:text-emerald-400">
            নিজের স্বাস্থ্য নেভিগেটর!
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl md:max-w-3xl mx-auto mb-10 leading-relaxed">
          মানসিক স্বাস্থ্য, মাতৃ ও শিশুর যত্ন, হাসপাতাল ও কমিউনিটি হেলথ তথ্য — সব এক জায়গায়। <br />
          সহজ, নির্ভরযোগ্য এবং হাবলুর মতো বন্ধুত্বপূর্ণ প্ল্যাটফর্ম।
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            // onClick={() => setShowLogin(true)}
            className="h-11 px-8 bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 inline-flex items-center justify-center rounded-md text-base font-medium transition-colors"
          >
            🎬 ডেমো দেখুন
          </button>
          <button
            onClick={() => setShowLogin(true)}
            className="h-11 px-8 bg-white text-gray-900 border border-slate-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-slate-700 dark:hover:bg-gray-700 inline-flex items-center justify-center rounded-md text-base font-medium transition-colors"
          >
            শুরু করুন
          </button>
        </div>
      </div>

      {/* Modals */}
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

export default Hero;
