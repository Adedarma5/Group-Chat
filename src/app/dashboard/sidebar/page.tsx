"use client";

import { MessageSquare, Settings, LogOut, User } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const [showSettings, setShowSettings] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user");
    document.cookie = "supabase_token=; path=/; max-age=0";

    router.push("/auth/login");
  };

  const menuItems = [
    { name: "Chat", icon: MessageSquare, path: "/dashboard" },
  ];

  return (
    <div className="w-12 bg-gray-200 flex flex-col items-center justify-between py-4">
      <div className="flex flex-col items-center w-full">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className={`mt-9 p-3 w-full flex items-center justify-center relative transition 
                ${isActive ? "bg-white" : "hover:bg-gray-100"}`}
            >
              <Icon size={18} />
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-1 h-6 mt-2 bg-indigo-700 rounded-r"></span>
              )}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="hover:bg-white p-3 rounded w-full flex items-center justify-center"
        >
          <Settings size={18} />
        </button>

        {showSettings && (
          <div className="absolute left-16 bottom-0 w-52 bg-white shadow-lg rounded-md overflow-hidden animate-fadeIn">
            <ul className="flex flex-col">
              <li
                onClick={() => {
                  setShowSettings(false);
                  router.push("/dashboard/profile");
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              >
                <User size={18} /> Profil Saya
              </li>
              <li
                onClick={handleLogout}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-red-500"
              >
                <LogOut size={18} /> Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
