"use client";

import React from "react";
import { Zap, HeartHandshake, MapPin } from "lucide-react"; // Changed icon for better representation

const features = [
  {
    title: "মানসিক স্বাস্থ্য সহায়তা",
    description: "সরাসরি মানসিক স্বাস্থ্য রিসোর্স এবং কমিউনিটি সাপোর্ট।",
    icon: HeartHandshake, // New Icon
  },
  {
    title: "মাতৃ ও শিশুর যত্ন",
    description: "গাইডলাইন, টিপস এবং হেলথ চেকলিস্ট সব এক জায়গায়।",
    icon: Zap, // New Icon
  },
  {
    title: "হাসপাতাল ও কমিউনিটি হেলথ",
    description: "স্থানীয় হাসপাতাল এবং কমিউনিটি হেলথ সেন্টার তথ্য।",
    icon: MapPin, // New Icon
  },
];

const Features = () => {
  return (
    <section className="bg-white dark:bg-gray-950 py-24 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
            আমাদের সেবাসমূহ
        </h2>
        <h3 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-8">
          হাবলুর <span className="text-emerald-600">প্রধান ফিচারস</span>
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-16 max-w-3xl mx-auto">
          আমাদের প্ল্যাটফর্ম আপনাকে একটি সহজ, নির্ভরযোগ্য এবং সম্পূর্ণ স্বাস্থ্য নেভিগেশন অভিজ্ঞতা দিতে ডিজাইন করা হয়েছে।
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature) => (
            // Card Container with Enhanced Professional Hover
            <div
              key={feature.title}
              className="group bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl transition-all duration-300 transform hover:shadow-emerald-500/30 dark:hover:shadow-emerald-700/50 hover:scale-[1.03] cursor-pointer"
            >
              <div className="flex items-center justify-center mb-5">
                <feature.icon 
                    // Icon styling for contrast and interactivity
                    className="w-10 h-10 p-2 rounded-full text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 transition-all duration-300 group-hover:text-white group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500" 
                />
              </div>
              
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center transition-colors duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                {feature.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;