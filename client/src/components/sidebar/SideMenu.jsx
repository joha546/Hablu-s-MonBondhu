"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, LogOut, Swords, ListChecks, User, Settings, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SideMenu = () => {
  // State for authentication data
  const [user, setUser] = useState(null);
  // State for the currently open mission (id)
  const [openMission, setOpenMission] = useState(null);
  // State for the actively selected task { missionId, taskName }
  const [activeTask, setActiveTask] = useState(null);
  // State for toggling logout button via settings icon
  const [showLogout, setShowLogout] = useState(false);

  const navigate = useNavigate();

  // --- Auth & Data Loading ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const currentUser = user || { name: "Guest", role: "Unauthenticated", initials: "G" };
  const initials = currentUser.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : currentUser.initials;

  // --- Mission Data ---
  const missions = [
    { id: 1, name: "Mission 1: Health Check-In", tasks: ["Task 1: Setup", "Task 2: Practice"] },
    { id: 2, name: "Mission 2: Health Map", tasks: ["Task 1: Map Area", "Task 2: Intel Gathering", "Task 3: Report"] },
    { id: 3, name: "Mission 3: Help Request", tasks: ["Task 1: Infiltrate", "Task 2: Secure Asset", "Task 3: Evade", "Task 4: Exfil"] },
    { id: 4, name: "Mission 4: Health Tips", tasks: ["Task 1: Resupply", "Task 2: Repair"] },
    { id: 5, name: "Mission 5: Maternal & Child", tasks: ["Task 1: Fortify", "Task 2: Hold Line", "Task 3: Counter-Attack"] },
    { id: 6, name: "Mission 6: Awareness Guide", tasks: ["Task 1: Initiate Contact", "Task 2: Negotiate Terms", "Task 3: Sign Accord"] },
    { id: 7, name: "Mission 7: Health Events", tasks: ["Task 1: Infiltrate", "Task 2: Gather Intel", "Task 3: Exfiltrate"] },
    { id: 8, name: "Mission 8: Health Worker", tasks: ["Task 1: Identify Target", "Task 2: Plan Infiltration", "Task 3: Execute Plan"] },
    { id: 9, name: "Mission 9: Health Data", tasks: ["Task 1: Map Area", "Task 2: Intel Gathering", "Task 3: Report"] },
    { id: 10, name: "Mission 10: Health Assistance", tasks: ["Task 1: Identify Target", "Task 2: Plan Disruption", "Task 3: Execute Disruption"] },

  ];

  const toggleMission = (id) => setOpenMission(openMission === id ? null : id);
  const handleTaskClick = (missionId, taskName) => setActiveTask({ missionId, taskName });
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  const getActiveMission = () => {
    if (!activeTask) return null;
    return missions.find(m => m.id === activeTask.missionId);
  };
  const activeMissionData = getActiveMission();
  const isAuthenticated = user !== null;

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-78 bg-[#1f2937] text-white p-5 flex flex-col justify-between shadow-xl">
        <div>
          {/* Logo/Title Section */}
          <div className="flex items-center text-3xl font-extrabold text-[#10b981] mb-6 border-b border-gray-700/50 pb-3">
            <Swords className="mr-3 w-8 h-8" />
            Hablu 2.0
          </div>

          {/* Missions List */}
          {isAuthenticated ? (
            <ul className="space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
              {missions.map((mission) => (
                <li key={mission.id}>
                  <button
                    onClick={() => toggleMission(mission.id)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      openMission === mission.id
                        ? "bg-[#10b981] text-white shadow-lg"
                        : "text-gray-200 hover:bg-gray-700/50 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center">
                      <ListChecks className="mr-2 w-4 h-4" />
                      {mission.name}
                    </span>
                    {openMission === mission.id ? (
                      <ChevronDown size={16} className="ml-2" />
                    ) : (
                      <ChevronRight size={16} className="ml-2" />
                    )}
                  </button>

                  {/* Tasks Sub-menu */}
                  {openMission === mission.id && (
                    <ul className="pl-6 pt-1 pb-1 space-y-0.5 border-l-2 border-gray-700 ml-3">
                      {mission.tasks.map((task, index) => {
                        const isActive = activeTask?.missionId === mission.id && activeTask?.taskName === task;
                        return (
                          <li
                            key={index}
                            onClick={() => handleTaskClick(mission.id, task)}
                            className={`px-3 py-1 text-sm rounded-md cursor-pointer transition-colors duration-150 ${
                              isActive
                                ? "bg-gray-600 text-[#10b981] font-semibold"
                                : "text-gray-300 hover:bg-gray-700/70 hover:text-white"
                            }`}
                          >
                            {task}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center p-4 bg-gray-800/50 rounded-lg text-gray-400">
              <Lock className="w-6 h-6 mx-auto mb-2 text-red-400" />
              <p className="text-sm">Please log in to view missions.</p>
            </div>
          )}
        </div>

        {/* --- User Profile & Logout Section --- */}
        <div className="border-t border-gray-700/50 pt-4 space-y-3">
          {/* User Card */}
          <div className="flex items-center p-2 rounded-lg bg-gray-800/50">
            <div className="w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md mr-3 shrink-0">
              {isAuthenticated ? initials : <User className="w-5 h-5" />}
            </div>
            <div className="grow min-w-0">
              <p className="text-sm font-semibold text-white truncate" title={currentUser.name}>
                {currentUser.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{currentUser.role || 'User'}</p>
            </div>
            {isAuthenticated && (
              <button
                title="Settings"
                className="p-1 rounded-full hover:bg-gray-700 text-gray-400 transition-colors shrink-0"
                onClick={() => setShowLogout(!showLogout)}
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Conditional Logout Button */}
          {isAuthenticated && showLogout && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-red-700 hover:text-white transition-colors duration-200"
            >
              <LogOut className="mr-2 w-5 h-5" />
              Secure Logout
            </button>
          )}

          {!isAuthenticated && (
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200"
            >
              <Lock className="mr-2 w-5 h-5" />
              Login / Sign Up
            </button>
          )}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3">
          Dashboard Overview
        </h2>

        {isAuthenticated && activeTask ? (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <p className="text-lg text-gray-500 mb-2">Currently Active Assignment:</p>
            <h3 className="text-2xl font-semibold text-[#10b981] mb-4">
              {activeMissionData?.name}
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xl font-bold text-gray-800">
                <span className="font-normal text-gray-600 mr-2">Task Focus:</span> {activeTask.taskName}
              </p>
              <p className="mt-3 text-gray-600">
                Details for <strong>{activeTask.taskName}</strong> from <strong>{activeMissionData?.name}</strong> would be displayed here.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center py-12">
            <p className="text-xl font-medium text-gray-700">
              {isAuthenticated ? "Select a Mission and a Task from the left sidebar to begin your assignment." : "You must be logged in to access  ."}
            </p>
            <p className="mt-2 text-gray-500">
              {isAuthenticated ? "The dashboard will update to show details for the selected task." : "Please use the login/sign up button above to continue."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SideMenu;