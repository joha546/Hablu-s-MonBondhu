"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Phone, Heart } from "lucide-react"; // Added Mail/Phone/Heart icons

const Footer = () => {
  const navLinks = [
    { href: "#", text: "হোম" },
    { href: "#articles", text: "আর্টিকেলস" },
    { href: "#tutorials", text: "টিউটোরিয়ালস" },
    { href: "#reviews", text: "রিভিউ" },
    { href: "#about", text: "আমাদের সম্পর্কে" },
  ];

  const socialLinks = [
    { href: "#", icon: <Facebook className="w-5 h-5" aria-label="Facebook" /> },
    { href: "#", icon: <Twitter className="w-5 h-5" aria-label="Twitter" /> },
    { href: "#", icon: <Instagram className="w-5 h-5" aria-label="Instagram" /> },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-black py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-10 border-b border-gray-700/50 pb-10">
        {/* Logo & Description (Now Column 1 & 2 on mobile) */}
        <div className="col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-extrabold text-lg">H</span>
                </div>
                <span className="font-extrabold text-xl text-white">
                    হাবলু <span className="text-emerald-500">২.০</span>
                </span>
            </Link>
            <p className="text-gray-400 text-sm max-w-xs">
                স্বাস্থ্য নেভিগেশন, কমিউনিটি সাপোর্ট এবং হেলথ রিসোর্স এক জায়গায়।
            </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-lg">নেভিগেশন</h4>
          <ul>
            {navLinks.map((link) => (
              <li key={link.text} className="mb-3">
                <a
                  href={link.href}
                  className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-lg">যোগাযোগ</h4>
          <p className="text-gray-400 text-sm mb-3 flex items-center">
            <Mail className="w-4 h-4 mr-2 text-emerald-400" />
            <a href="mailto:info@hablu.com" className="hover:text-emerald-400 transition-colors">info@hablu.com</a>
          </p>
          <p className="text-gray-400 text-sm flex items-center">
            <Phone className="w-4 h-4 mr-2 text-emerald-400" />
            <a href="tel:+8801234567890" className="hover:text-emerald-400 transition-colors">+880 1234 567890</a>
          </p>
        </div>
        
        {/* Social Media */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-lg">সোশ্যাল</h4>
          <div className="flex space-x-4">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 transform hover:scale-110"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-10 pt-6 text-center text-gray-500 text-sm">
        <p className="flex justify-center items-center">
            &copy; {new Date().getFullYear()} হাবলু ২.০. <span className="mx-2">সর্বসত্ব সংরক্ষিত।</span>
            <span className="text-red-500 ml-2 flex items-center">
                Made with <Heart className="w-4 h-4 ml-1" />
            </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;