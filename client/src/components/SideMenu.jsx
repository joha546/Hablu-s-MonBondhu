import {
  ListChecks,
  Lock,
  LogOut,
  Menu,
  Settings,
  Swords,
  User,
  X,
  HeartPulse,
  Map,
  LifeBuoy,
  MessageSquare,
  Baby,
  BookOpen,
  Users,
  Stethoscope,
  Info,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const getIcon = (iconName) => {
  const icons = {
    HeartPulse,
    Map,
    LifeBuoy,
    MessageSquare,
    Baby,
    BookOpen,
    Users,
    Stethoscope,
    Info,
    ListChecks,
  };
  return icons[iconName] || ListChecks;
};

const AppLayout = () => {
  const [user, setUser] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const loadUserFromStorage = () => {
    const storedUser = localStorage.getItem("user");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true" && storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    const handleUserChange = () => loadUserFromStorage();
    loadUserFromStorage();
    ["storage", "userLogin", "userLogout"].forEach((evt) =>
      window.addEventListener(evt, handleUserChange)
    );
    return () =>
      ["storage", "userLogin", "userLogout"].forEach((evt) =>
        window.removeEventListener(evt, handleUserChange)
      );
  }, []);

  const handleLogout = () => {
    ["isLoggedIn", "user", "token"].forEach((k) => localStorage.removeItem(k));
    setUser(null);
    window.dispatchEvent(new Event("userLogout"));
    navigate("/");
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const currentUser =
    user || { name: "অতিথি", role: "অননুমোদিত", initials: "অ" };

  const initials = currentUser.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : currentUser.initials;

  const missions = [
    { id: 1, name: "স্বাস্থ্য চেক-ইন", path: "mission1", icon: "HeartPulse" },
    { id: 2, name: "স্বাস্থ্য মানচিত্র", path: "mission2", icon: "Map" },
    { id: 3, name: "সহায়তা অনুরোধ", path: "mission3", icon: "LifeBuoy" },
    { id: 4, name: "স্বাস্থ্য পরামর্শ", path: "mission4", icon: "MessageSquare" },
    { id: 5, name: "মাতৃ ও শিশু যত্ন", path: "mission5", icon: "Baby" },
    { id: 6, name: "সচেতনতা নির্দেশিকা", path: "mission6", icon: "BookOpen" },
    { id: 7, name: "স্বাস্থ্য অনুষ্ঠান", path: "mission7", icon: "Users" },
    { id: 8, name: "স্বাস্থ্যকর্মী", path: "mission8", icon: "Stethoscope" },
    { id: 9, name: "স্বাস্থ্য তথ্য", path: "mission9", icon: "Info" },
  ];

  const isAuthenticated = !!user;
  const handleNavLinkClick = () => {
    if (isMenuOpen) setIsMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-3 rounded-full bg-[#1f2937] text-[#10b981] shadow-md hover:bg-gray-800 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <aside
        onMouseEnter={() => window.innerWidth >= 768 && setIsHovered(true)}
        onMouseLeave={() => window.innerWidth >= 768 && setIsHovered(false)}
        className={`fixed inset-y-0 left-0 z-50 bg-[#1f2937] text-white p-5 flex flex-col justify-between shadow-xl transition-all duration-300 ease-in-out
          ${isMenuOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
          ${isHovered ? "md:w-64" : "md:w-20"}
          h-screen overflow-hidden select-none`}
      >
        {/* Top Section */}
        <div className="flex flex-col flex-grow">
          <div className="flex items-center text-2xl font-extrabold text-[#10b981] mb-6 border-b border-gray-700/50 pb-3">
            <Swords className="mr-2 w-7 h-7 shrink-0" />
            <span
              className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                isHovered || isMenuOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
              }`}
            >
              হাবলু ২.০
            </span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="md:hidden ml-auto p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Missions */}
          {isAuthenticated ? (
            <ul className="space-y-1 mt-2">
              {missions.map((mission) => {
                const MissionIcon = getIcon(mission.icon);
                return (
                  <li key={mission.id}>
                    <NavLink
                      to={mission.path}
                      onClick={handleNavLinkClick}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-[#10b981] text-white shadow-md"
                            : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                        }`
                      }
                    >
                      {/* ICON: only visible on desktop */}
                      <MissionIcon
                        className={`w-5 h-5 shrink-0 ${
                          isMenuOpen ? "hidden md:block" : "block"
                        } ${isHovered ? "md:mr-3" : "md:mr-0"}`}
                      />
                      {/* TEXT: only visible on mobile open OR desktop expanded */}
                      <span
                        className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                          isMenuOpen
                            ? "opacity-100 w-auto"
                            : "opacity-0 w-0"
                        } ${
                          isHovered
                            ? "md:opacity-100 md:w-auto md:ml-3"
                            : "md:opacity-0 md:w-0"
                        }`}
                      >
                        {mission.name}
                      </span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center p-4 bg-gray-800/50 rounded-lg text-gray-400">
              <Lock className="w-6 h-6 mx-auto mb-2 text-red-400" />
              <p className="text-sm">দয়া করে লগইন করে মিশনগুলো দেখুন।</p>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700/50 pt-4 space-y-3 mt-auto">
          <div className="flex items-center p-2 rounded-lg bg-gray-800/50">
            <div className="w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md mr-3 shrink-0">
              {isAuthenticated ? initials : <User className="w-5 h-5" />}
            </div>
            <div
              className={`flex-1 min-w-0 transition-all duration-300 ${
                isHovered || isMenuOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
              }`}
            >
              <p
                className="text-sm font-semibold text-white truncate"
                title={currentUser.name}
              >
                {currentUser.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {currentUser.role || "ব্যবহারকারী"}
              </p>
            </div>
            {isAuthenticated && (
              <button
                title="সেটিংস"
                className="p-1 rounded-full hover:bg-gray-700 text-gray-400 transition-colors shrink-0"
                onClick={() => setShowLogout((prev) => !prev)}
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>

          {isAuthenticated && showLogout && (
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-red-700 hover:text-white transition-colors duration-200 ${
                !isMenuOpen && !isHovered ? "md:hidden" : ""
              }`}
            >
              <LogOut className="mr-2 w-5 h-5" />
              নিরাপদ লগআউট
            </button>
          )}

          {!isAuthenticated && (
            <button
              onClick={() => {
                navigate("/");
                if (isMenuOpen) setIsMenuOpen(false);
              }}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 ${
                !isMenuOpen && !isHovered ? "md:hidden" : ""
              }`}
            >
              <Lock className="mr-2 w-5 h-5" />
              লগইন / সাইন আপ
            </button>
          )}
        </div>
      </aside>

      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto md:ml-20 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
