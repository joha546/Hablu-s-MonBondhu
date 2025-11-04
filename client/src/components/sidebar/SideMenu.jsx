"use client";

import {
  ChevronDown,
  ChevronRight,
  ListChecks,
  Lock,
  LogOut,
  Settings,
  Swords,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Mission1 from "../Mission 1/Mission1"; // Import Mission1

const SideMenu = () => {
  const [user, setUser] = useState(null);
  const [openMission, setOpenMission] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [showLogout, setShowLogout] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const currentUser = user || { name: "অতিথি", role: "অননুমোদিত", initials: "অ" };
  const initials = currentUser.name
    ? currentUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
    : currentUser.initials;

  const missions = [
    { id: 1, name: "মিশন ১: স্বাস্থ্য চেক-ইন", tasks: ["কাজ ১: সেটআপ", "কাজ ২: অনুশীলন"] },
    { id: 2, name: "মিশন ২: স্বাস্থ্য মানচিত্র", tasks: ["কাজ ১: এলাকা মানচিত্র", "কাজ ২: তথ্য সংগ্রহ", "কাজ ৩: প্রতিবেদন"] },
    { id: 3, name: "মিশন ৩: সহায়তা অনুরোধ", tasks: ["কাজ ১: প্রবেশ", "কাজ ২: সম্পদ সুরক্ষা", "কাজ ৩: এড়ানো", "কাজ ৪: প্রত্যাবর্তন"] },
    { id: 4, name: "মিশন ৪: স্বাস্থ্য পরামর্শ", tasks: ["কাজ ১: পুনঃসরবরাহ", "কাজ ২: মেরামত"] },
    { id: 5, name: "মিশন ৫: মাতৃ ও শিশু যত্ন", tasks: ["কাজ ১: সুরক্ষা", "কাজ ২: প্রতিরোধ", "কাজ ৩: প্রতিঘাত"] },
    { id: 6, name: "মিশন ৬: সচেতনতা নির্দেশিকা", tasks: ["কাজ ১: যোগাযোগ শুরু", "কাজ ২: আলোচনার প্রস্তুতি", "কাজ ৩: চুক্তি স্বাক্ষর"] },
    { id: 7, name: "মিশন ৭: স্বাস্থ্য অনুষ্ঠান", tasks: ["কাজ ১: প্রবেশ", "কাজ ২: তথ্য সংগ্রহ", "কাজ ৩: প্রত্যাবর্তন"] },
    { id: 8, name: "মিশন ৮: স্বাস্থ্যকর্মী", tasks: ["কাজ ১: লক্ষ্য নির্ধারণ", "কাজ ২: পরিকল্পনা তৈরি", "কাজ ৩: কার্যকরী বাস্তবায়ন"] },
    { id: 9, name: "মিশন ৯: স্বাস্থ্য তথ্য", tasks: ["কাজ ১: মানচিত্র তৈরি", "কাজ ২: তথ্য সংগ্রহ", "কাজ ৩: প্রতিবেদন"] },
    { id: 10, name: "মিশন ১০: স্বাস্থ্য সহায়তা", tasks: ["কাজ ১: লক্ষ্য চিহ্নিত", "কাজ ২: ব্যাঘাত পরিকল্পনা", "কাজ ৩: বাস্তবায়ন"] },
  ];

  const toggleMission = (id) => setOpenMission(openMission === id ? null : id);
  const handleTaskClick = (missionId, taskName) =>
    setActiveTask({ missionId, taskName });
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  const getActiveMission = () => {
    if (!activeTask) return null;
    return missions.find((m) => m.id === activeTask.missionId);
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
            হাবলু ২.০
          </div>

          {/* Missions List */}
          {isAuthenticated ? (
            <ul className="space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
              {missions.map((mission) => (
                <li key={mission.id}>
                  <button
                    onClick={() => toggleMission(mission.id)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${openMission === mission.id
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

                  {openMission === mission.id && (
                    <ul className="pl-6 pt-1 pb-1 space-y-0.5 border-l-2 border-gray-700 ml-3">
                      {mission.tasks.map((task, index) => {
                        const isActive =
                          activeTask?.missionId === mission.id &&
                          activeTask?.taskName === task;
                        return (
                          <li
                            key={index}
                            onClick={() => handleTaskClick(mission.id, task)}
                            className={`px-3 py-1 text-sm rounded-md cursor-pointer transition-colors duration-150 ${isActive
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
              <p className="text-sm font-semibold text-white truncate" title={currentUser.name}>
                {currentUser.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{currentUser.role || "ব্যবহারকারী"}</p>
            </div>
            {isAuthenticated && (
              <button
                title="সেটিংস"
                className="p-1 rounded-full hover:bg-gray-700 text-gray-400 transition-colors shrink-0"
                onClick={() => setShowLogout(!showLogout)}
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
      <div className="flex-1 p-8">
        {isAuthenticated && activeTask ? (
          <>
            {/* Render Mission1 only for মিশন ১ -> কাজ ১ */}
            {activeTask.taskName === "কাজ ১: সেটআপ" && activeMissionData?.id === 1 ? (
              <Mission1 />
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <p className="text-lg text-gray-500 mb-2">বর্তমান সক্রিয় কাজ:</p>
                <h3 className="text-2xl font-semibold text-[#10b981] mb-4">
                  {activeMissionData?.name}
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-800">
                    <span className="font-normal text-gray-600 mr-2">কাজের নাম:</span> {activeTask.taskName}
                  </p>
                  <p className="mt-3 text-gray-600">
                    <strong>{activeMissionData?.name}</strong> মিশনের{" "}
                    <strong>{activeTask.taskName}</strong> সংক্রান্ত বিস্তারিত তথ্য এখানে প্রদর্শিত হবে।
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center py-12">
            <p className="text-xl font-medium text-gray-700">
              {isAuthenticated
                ? "বাম দিকের সাইডবার থেকে একটি মিশন ও কাজ নির্বাচন করুন।"
                : "আপনাকে লগইন করতে হবে ড্যাশবোর্ড অ্যাক্সেসের জন্য।"}
            </p>
            <p className="mt-2 text-gray-500">
              {isAuthenticated
                ? "ড্যাশবোর্ডে নির্বাচিত কাজের বিস্তারিত দেখা যাবে।"
                : "চালিয়ে যেতে লগইন/সাইন আপ বাটন ব্যবহার করুন।"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SideMenu;
