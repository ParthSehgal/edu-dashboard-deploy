"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({ children, requiredRole }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!token || !userRole) {
      router.push("/");
      return;
    }

    if (requiredRole && requiredRole !== userRole) {
      router.push(`/dashboard/${userRole}`);
      return;
    }

    setLoading(false);
  }, [router, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role={requiredRole} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar role={requiredRole} />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
