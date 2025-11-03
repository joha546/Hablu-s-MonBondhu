"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, Search, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Login from "./Login";
import SignUp from "./SignUp";
import Modal from "./Modal";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const navLinks = [
    { href: "#", text: "হোম" },
    { href: "#", text: "আর্টিকেলস" },
    { href: "#", text: "টিউটোরিয়ালস" },
    { href: "#", text: "রিভিউ" },
    { href: "#", text: "আমাদের সম্পর্কে" },
  ];

  useEffect(() => {
    document.body.style.overflow =
      isMenuOpen || showLogin || showSignUp ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isMenuOpen, showLogin, showSignUp]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedToken) setDropdownOpen(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setDropdownOpen(false);
    navigate("/");
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setShowLogin(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* লোগো */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                হাবলু ২.০
              </span>
            </Link>

            {/* ডেস্কটপ মেনু */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.text}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300"
                >
                  {link.text}
                </a>
              ))}
            </nav>

            {/* ডান পাশ */}
            <div className="hidden md:flex items-center space-x-3 relative">
              <button className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Search className="h-5 w-5" />
              </button>

              {!user ? (
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  শুরু করুন
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-white"
                  >
                    <User className="w-6 h-6" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-2 z-50">
                      <p className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 font-medium">
                        {user.name || "ইউজার"}
                      </p>

                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setDropdownOpen(false)}
                      >
                        ড্যাশবোর্ড
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        লগ আউট
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* মোবাইল মেনু বোতাম */}
            <div className="md:hidden flex items-center relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                aria-label="মেনু টগল করুন"
              >
                <Menu
                  className={`h-6 w-6 transition-transform duration-300 ${
                    isMenuOpen ? "rotate-90 scale-0" : "rotate-0 scale-100"
                  }`}
                />
                <X
                  className={`h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ${
                    isMenuOpen ? "rotate-0 scale-100" : "-rotate-90 scale-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* মডাল */}
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
    </>
  );
};

export default Navbar;
