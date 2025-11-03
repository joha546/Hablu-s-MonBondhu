"use client";

import React, { useEffect, useState } from "react";

const statsData = [
  { label: "সক্রিয় ব্যবহারকারী", value: 12000 },
  { label: "প্রকাশিত আর্টিকেলস", value: 350 },
  { label: "সংযুক্ত হাসপাতাল", value: 45 },
  { label: "কমিউনিটি মেম্বারস", value: 7800 },
];

const Stats = () => {
  const [counts, setCounts] = useState(statsData.map(() => 0));

  useEffect(() => {
    const duration = 2000; // animation duration in ms
    const steps = 60; // number of steps in animation
    const interval = duration / steps;

    statsData.forEach((stat, index) => {
      let start = 0;
      const increment = stat.value / steps;

      const counter = setInterval(() => {
        start += increment;
        setCounts((prev) => {
          const newCounts = [...prev];
          newCounts[index] = Math.min(Math.round(start), stat.value);
          return newCounts;
        });

        if (start >= stat.value) clearInterval(counter);
      }, interval);
    });
  }, []);

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12">
          আমাদের প্ল্যাটফর্মের সংখ্যা
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {statsData.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-[0_0_25px_rgba(16,185,129,0.7)] transition-shadow duration-300 hover:scale-105 cursor-pointer"
            >
              <p className="text-4xl font-bold text-emerald-600 mb-2">
                {counts[index].toLocaleString()}
              </p>
              <p className="text-gray-700 dark:text-gray-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
