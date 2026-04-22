"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import AssignmentHub from "@/components/Dashboard/Student/AssignmentHub";

export default function StudentDashboard() {
  const [user, setUser] = useState({
    name: "Student",
    department: "Unknown",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(prev => ({ ...prev, ...JSON.parse(storedUser) }));
    }
  }, []);

  return (
    <DashboardLayout requiredRole="student">
      <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] bg-slate-50/50">
        
        {/* Header Section */}
        <div className="mb-10 p-10 bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
              Welcome back, <span className="text-indigo-600">{user.name}</span>.
            </h1>
            <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="mt-6 md:mt-0 px-6 py-4 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200 relative z-10 border border-slate-800">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Department</p>
            <p className="text-white font-bold text-lg mt-1">{user.department}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full space-y-12">
          <AssignmentHub />
        </div>
      </div>
    </DashboardLayout>
  );
}
