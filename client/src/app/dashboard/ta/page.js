"use client";

import DashboardLayout from "@/components/Layout/DashboardLayout";
import { BookMarked, Users, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { coursesAPI } from "@/lib/api";
import Link from "next/link";

export default function TADashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await coursesAPI.getMyCourses();
        setCourses(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  return (
    <DashboardLayout requiredRole="ta">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">TA Dashboard</h1>
          <p className="text-slate-500 mt-1">Review top submissions and track grading progress for your assigned courses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{courses.length}</h3>
            <p className="text-sm text-slate-500 font-medium">Assigned Courses</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-slate-800 mb-4">Your Courses</h2>
      {loading ? (
        <div className="flex justify-center my-12"><div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div></div>
      ) : courses.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center border shadow-sm mb-10 text-slate-500">
          You are not assigned to any courses as a TA.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <Link key={c._id} href={`/dashboard/ta/courses/${c.courseId}`} className="block">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">{c.courseId}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{c.title}</h3>
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-auto pt-4 border-t border-slate-50">
                  <Users className="w-4 h-4" />
                  <span>{c.students?.length || 0} Enrolled Students to Grade</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
