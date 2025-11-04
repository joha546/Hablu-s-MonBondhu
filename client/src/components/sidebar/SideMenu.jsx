import {
  ListChecks,
  Lock,
  LogOut,
  Settings,
  Swords,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const SideMenu = () => {
  const [user, setUser] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
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

    return () => {
      ["storage", "userLogin", "userLogout"].forEach((evt) =>
        window.removeEventListener(evt, handleUserChange)
      );
    };
  }, []);

  const handleLogout = () => {
    ["isLoggedIn", "user", "token"].forEach((k) =>
      localStorage.removeItem(k)
    );
    setUser(null);
    window.dispatchEvent(new Event("userLogout"));
    navigate("/");
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
    { id: 1, name: "স্বাস্থ্য চেক-ইন", path: "mission1" },
    { id: 2, name: "স্বাস্থ্য মানচিত্র", path: "mission2" },
    { id: 3, name: "সহায়তা অনুরোধ", path: "mission3" },
    { id: 4, name: "স্বাস্থ্য পরামর্শ", path: "mission4" },
    { id: 5, name: "মাতৃ ও শিশু যত্ন", path: "mission5" },
    { id: 6, name: "সচেতনতা নির্দেশিকা", path: "mission6" },
    { id: 7, name: "স্বাস্থ্য অনুষ্ঠান", path: "mission7" },
    { id: 8, name: "স্বাস্থ্যকর্মী", path: "mission8" },
    { id: 9, name: "স্বাস্থ্য তথ্য", path: "mission9" },
  ];

  const isAuthenticated = !!user;

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-[#1f2937] text-white p-5 flex flex-col justify-between shadow-xl">
        <div>
          {/* Logo */}
          <div className="flex items-center text-3xl font-extrabold text-[#10b981] mb-6 border-b border-gray-700/50 pb-3">
            <Swords className="mr-3 w-8 h-8" />
            হাবলু ২.০
          </div>

          {/* Missions */}
          {isAuthenticated ? (
            <ul className="space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-thin scrollbar-thumb-gray-700">
              {missions.map((mission) => (
                <li key={mission.id}>
                  <NavLink
                    to={mission.path}
                    className={({ isActive }) =>
                      `w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                        ? "bg-[#10b981] text-white shadow-lg"
                        : "text-gray-200 hover:bg-gray-700/50 hover:text-white"
                      }`
                    }
                  >
                    <ListChecks className="mr-2 w-4 h-4" />
                    {mission.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center p-4 bg-gray-800/50 rounded-lg text-gray-400">
              <Lock className="w-6 h-6 mx-auto mb-2 text-red-400" />
              <p className="text-sm">দয়া করে লগইন করে মিশনগুলো দেখুন।</p>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="border-t border-gray-700/50 pt-4 space-y-3">
          <div className="flex items-center p-2 rounded-lg bg-gray-800/50">
            <div className="w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md mr-3 shrink-0">
              {isAuthenticated ? initials : <User className="w-5 h-5" />}
            </div>
            <div className="grow min-w-0">
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
              className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-red-700 hover:text-white transition-colors duration-200"
            >
              <LogOut className="mr-2 w-5 h-5" />
              নিরাপদ লগআউট
            </button>
          )}

          {!isAuthenticated && (
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200"
            >
              <Lock className="mr-2 w-5 h-5" />
              লগইন / সাইন আপ
            </button>
          )}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default SideMenu;
