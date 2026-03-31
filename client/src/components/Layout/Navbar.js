"use client";

import { LogOut, Bell, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar({ role }) {
  const router = useRouter();
  const [user, setUser] = useState({ name: "Loading..." });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <header className="h-20 bg-white border-b sticky top-0 z-10 flex items-center justify-between px-8">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses, assignments..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button className="relative text-slate-500 hover:text-slate-800 transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 pl-6 border-l">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
            <User className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-slate-500 capitalize">{role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
