"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, Search, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Login from "./Login";
import SignUp from "./SignUp";
import Modal from "./Modal";

// Custom Hook to manage shared Auth State (Best Practice for large apps: use a Context API instead)
const useAuth = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check local storage for existing user/token
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setShowLogin(false);
  };

  return {
    user,
    setUser,
    showLogin,
    setShowLogin,
    showSignUp,
    setShowSignUp,
    handleLoginSuccess,
    navigate, // Keep navigate for logout
  };
};

const Navbar = ({ onOpenLogin }) => { // Receives a handler from parent/context
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Use the common auth state and handlers
  const { user, setUser, showLogin, setShowLogin, showSignUp, setShowSignUp, handleLoginSuccess, navigate } = useAuth();
  
  // Adjusted Login/Sign up to use local state/props
  const openLogin = onOpenLogin || (() => setShowLogin(true)); // Fallback if not passed

  const navLinks = [
    { href: "#", text: "হোম" },
    { href: "#articles", text: "আর্টিকেলস" },
    { href: "#tutorials", text: "টিউটোরিয়ালস" },
    { href: "#reviews", text: "রিভিউ" },
    { href: "#about", text: "আমাদের সম্পর্কে" },
  ];

  useEffect(() => {
    // Better handling: only disable scroll when a modal/menu is active
    document.body.style.overflow =
      isMenuOpen || showLogin || showSignUp ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isMenuOpen, showLogin, showSignUp]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setDropdownOpen(false);
    navigate("/");
  };
  
  // Toggling menu and closing dropdown if needed
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if(isMenuOpen) setDropdownOpen(false);
  };
  
  const handleLinkClick = () => {
    setIsMenuOpen(false); // Close mobile menu on link click
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-emerald-500/10 dark:border-emerald-500/10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* লোগো */}
            <Link to="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-extrabold text-lg">H</span>
              </div>
              <span className="font-extrabold text-xl text-gray-900 dark:text-white">
                হাবলু <span className="text-emerald-600">২.০</span>
              </span>
            </Link>

            {/* ডেস্কটপ মেনু */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.text}
                  href={link.href}
                  className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 tracking-wide"
                >
                  {link.text}
                </a>
              ))}
            </nav>

            {/* ডান পাশ */}
            <div className="hidden md:flex items-center space-x-4 relative">
              <button className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200" aria-label="Search">
                <Search className="h-5 w-5" />
              </button>

              {!user ? (
                <button
                  onClick={openLogin}
                  className="px-5 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300 shadow-lg shadow-emerald-500/30 dark:shadow-emerald-700/30 transform hover:scale-[1.02]"
                >
                  শুরু করুন
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-700 flex items-center justify-center text-emerald-800 dark:text-white ring-2 ring-emerald-500/50 hover:ring-emerald-500 transition-all duration-200"
                    aria-label="User Menu"
                  >
                    <User className="w-6 h-6" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in-0 slide-in-from-top-1">
                      <p className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 font-bold border-b dark:border-gray-700/50">
                        {user.name || "ইউজার"}
                      </p>

                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        ড্যাশবোর্ড
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
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
                onClick={toggleMenu}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                aria-label="মেনু টগল করুন"
              >
                <span className={`transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}>
                    <Menu className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </span>
                <span className={`transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}>
                    <X className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </span>
              </button>
            </div>
          </div>
        </div>
        
        {/* মোবাইল মেনু কন্টেইনার */}
        <div
            className={`fixed inset-0 top-16 bg-white dark:bg-gray-900 z-40 transform transition-transform duration-300 ease-in-out ${
                isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            } md:hidden`}
        >
            <nav className="flex flex-col p-4 space-y-2">
                {navLinks.map((link) => (
                    <a
                        key={link.text}
                        href={link.href}
                        onClick={handleLinkClick}
                        className="block px-4 py-3 text-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        {link.text}
                    </a>
                ))}
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    {!user ? (
                        <button
                            onClick={() => { handleLinkClick(); openLogin(); }}
                            className="w-full px-4 py-3 text-lg font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg"
                        >
                            লগইন / সাইন আপ
                        </button>
                    ) : (
                        <>
                            <Link
                                to="/dashboard"
                                onClick={handleLinkClick}
                                className="block px-4 py-3 text-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                ড্যাশবোর্ড
                            </Link>
                            <button
                                onClick={() => { handleLinkClick(); handleLogout(); }}
                                className="w-full text-left px-4 py-3 text-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                লগ আউট
                            </button>
                        </>
                    )}
                </div>
            </nav>
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