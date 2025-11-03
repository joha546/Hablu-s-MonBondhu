"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

// Assuming openLogin is passed as a prop from the component rendering both Navbar and Hero
const Hero = ({ openLogin }) => { 
  
  // Note: Removed all redundant state (showLogin, showSignUp, user) and modal imports.

  return (
    <section className="bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center h-[92vh] text-center px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Top Badge / Mini info */}
        <div className="mb-6 flex justify-center animate-in fade-in slide-in-from-top-4 duration-500">
          <a
            href="#"
            className="inline-flex items-center gap-2 border border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-800/60 transition-colors duration-300 shadow-md"
          >
            <span>
              হাবলু - কমিউনিটি হেলথ নেভিগেটর বাংলাদেশ (CNHRB™)
            </span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl mb-6 animate-in fade-in slide-in-from-top-6 duration-700">
          হাবলু এখন{" "}
          <span className="text-emerald-600 dark:text-emerald-400">
            নিজের স্বাস্থ্য নেভিগেটর!
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl md:max-w-4xl mx-auto mb-10 leading-relaxed animate-in fade-in delay-200 duration-700">
          মানসিক স্বাস্থ্য, মাতৃ ও শিশুর যত্ন, হাসপাতাল ও কমিউনিটি হেলথ তথ্য — সব এক জায়গায়। <br />
          সহজ, নির্ভরযোগ্য এবং হাবলুর মতো বন্ধুত্বপূর্ণ প্ল্যাটফর্ম।
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-8 delay-300 duration-700">
          <button
            onClick={openLogin} // Use the passed-in prop to open the modal
            className="h-12 px-8 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 inline-flex items-center justify-center rounded-xl text-lg font-semibold transition-all duration-300 shadow-xl shadow-emerald-500/40 dark:shadow-emerald-700/50 transform hover:scale-[1.05] hover:shadow-2xl"
          >
            এখনই শুরু করুন!
          </button>
          <a
            href="#"
            className="h-12 px-8 bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 inline-flex items-center justify-center rounded-xl text-lg font-medium transition-colors duration-300"
          >
            🎬 ডেমো দেখুন
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;