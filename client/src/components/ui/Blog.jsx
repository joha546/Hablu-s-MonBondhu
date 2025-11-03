"use client";

import React from "react";
import { ArrowRight, BookOpen } from "lucide-react"; // Added BookOpen icon

const articles = [
  {
    title: "মানসিক স্বাস্থ্য সচেতনতা কিভাবে বাড়ানো যায়",
    description:
      "আপনার মানসিক স্বাস্থ্য রক্ষা করতে সহজ ও কার্যকর কিছু টিপস।",
    href: "#",
  },
  {
    title: "মাতৃ ও শিশুর যত্নের গাইডলাইন",
    description:
      "মায়ের জন্য স্বাস্থ্যকর অভ্যাস এবং শিশুর যত্ন সম্পর্কিত তথ্য।",
    href: "#",
  },
  {
    title: "স্থানীয় হাসপাতাল এবং কমিউনিটি হেলথ রিসোর্স",
    description:
      "আপনার কাছে থাকা স্বাস্থ্যকেন্দ্র এবং কমিউনিটি হেলথ তথ্য।",
    href: "#",
  },
];

const Blog = () => {
  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-24 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
            জ্ঞান ভান্ডার
        </h2>
        <h3 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-8">
          সাম্প্রতিক <span className="text-emerald-600">আর্টিকেলস</span>
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-16 max-w-3xl mx-auto">
          হাবলুর কমিউনিটি এবং স্বাস্থ্যবিষয়ক তথ্যের সাম্প্রতিক আর্টিকেলস, যা আপনাকে সঠিক পথে নিয়ে যেতে সাহায্য করবে।
        </p>

        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-10">
          {articles.map((article) => (
            <a
              key={article.title}
              href={article.href}
              // Card design with strong interactive lift and shadow
              className="group block text-left bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-300 transform hover:shadow-2xl hover:shadow-emerald-500/30 dark:hover:shadow-emerald-700/50 hover:scale-[1.03]"
            >
              <BookOpen className="w-8 h-8 text-emerald-600 mb-4 transition-colors duration-300 group-hover:text-emerald-500" />
              
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                {article.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                {article.description}
              </p>
              
              <span
                className="inline-flex items-center text-md font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-200"
              >
                আরও পড়ুন <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </a>
          ))}
        </div>
        
        <div className="mt-16">
            <a 
                href="#"
                className="px-8 py-3 text-lg font-semibold border-2 border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
            >
                সকল আর্টিকেল দেখুন
            </a>
        </div>
      </div>
    </section>
  );
};

export default Blog;