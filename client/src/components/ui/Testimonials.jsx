"use client";

import React from "react";
import { User, Quote } from "lucide-react"; // Import Quote icon

const testimonials = [
  {
    name: "মাহরিনা রহমান",
    role: "কমিউনিটি মেম্বার",
    comment:
      "হাবলু আমাকে মানসিক স্বাস্থ্য এবং মাতৃ যত্ন সম্পর্কে সহজে গাইড করেছে। সত্যিই দারুণ প্ল্যাটফর্ম!",
  },
  {
    name: "রাশেদুল ইসলাম",
    role: "হেলথ এডভোকেট",
    comment:
      "কমিউনিটি হেলথ রিসোর্স এখানে খুব সুন্দরভাবে একত্রিত করা হয়েছে। আমার বন্ধুদেরও রেফার করেছি।",
  },
  {
    name: "সাবিনা আক্তার",
    role: "মা ও ব্লগার",
    comment:
      "হাসপাতাল এবং কমিউনিটি হেলথ তথ্য পাওয়া এখন অনেক সহজ। হাবলু ব্যবহার করে খুব সুবিধা পেয়েছি।",
  },
];

const Testimonials = () => {
return (
    <section className="bg-gray-100 dark:bg-gray-800 py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
                সফলতার গল্প
            </h2>
            <h3 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-8">
              কমিউনিটির <span className="text-emerald-600">মন্তব্য</span>
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-16 max-w-3xl mx-auto">
                যারা আমাদের প্ল্যাটফর্ম ব্যবহার করে উপকৃত হয়েছেন, তাদের কিছু কথা।
            </p>

            <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-10">
                {testimonials.map((testi) => (
                    <div
                        key={testi.name}
                        // Professional Card Design with Subtle Hover
                        className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border-t-4 border-emerald-500/70 transition-all duration-300 transform hover:shadow-2xl hover:-translate-y-1 group"
                    >
                        
                        <Quote className="w-8 h-8 text-emerald-500/50 mb-4 mx-auto rotate-180 transition-transform duration-300 group-hover:text-emerald-600" /> 
                        
                        <p className="text-base text-gray-700 dark:text-gray-300 text-center italic mb-6">
                            “{testi.comment}”
                        </p>

                        <div className="flex flex-col items-center justify-center pt-4 border-t border-gray-100 dark:border-gray-700">
                            {/* Avatar/User Icon */}
                            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-2 ring-emerald-500/50 mb-3">
                                <User className="w-6 h-6" />
                            </div>
                            
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white text-center">
                                {testi.name}
                            </h4>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 text-center font-medium">
                                {testi.role}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);
};

export default Testimonials;