"use client";
import DashboardLayout from "@/components/Layout/DashboardLayout";

export default function StudentCourses() {
  return (
    <DashboardLayout requiredRole="student">
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">My Courses</h2>
        <p className="text-slate-500">You are currently enrolled in 3 active courses.</p>
        <div className="mt-8 text-slate-400 bg-slate-50 p-6 rounded-xl border border-dashed border-slate-200">
          Courses detailed view (Placeholder for API integration)
        </div>
      </div>
    </DashboardLayout>
  );
}
