"use client";

import DashboardLayout from "@/components/Layout/DashboardLayout";
import { BookMarked, ArrowRight, Search, PlusCircle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import api, { coursesAPI } from "@/lib/api";

export default function TACourses() {
  const [activeTab, setActiveTab] = useState("my");
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetchData();
    fetchUserId();
  }, []);

  async function fetchUserId() {
    try {
      const res = await api.get('/auth/me');
      setUserId(res.data.data._id);
    } catch(e){}
  }

  async function fetchData() {
    setLoading(true);
    try {
      const [myRes, allRes] = await Promise.all([
        api.get("/ta/assigned-courses"),
        coursesAPI.getAllCourses()
      ]);
      setMyCourses(myRes.data.courses || []);
      setAllCourses(allRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch TA courses", error);
    } finally {
      setLoading(false);
    }
  }

  const handleRequestTA = async (courseId) => {
    setRequestingId(courseId);
    try {
      await coursesAPI.requestTaAssignment(courseId);
      alert("Successfully requested to TA for this course!");
      fetchData(); // Refresh to update status
    } catch (error) {
      alert(error.response?.data?.message || "Failed to request TA assignment");
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <DashboardLayout requiredRole="ta">
      <div className="mb-8 pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Teaching Assistant Hub</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Manage your assigned courses or browse department courses to request TA positions.
        </p>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab("my")}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === "my"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          My TA Assignments
        </button>
        <button
          onClick={() => setActiveTab("browse")}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === "browse"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Browse Department Courses
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center my-16">
          <div className="w-7 h-7 rounded-full border-[3px] border-slate-200 border-t-indigo-600 animate-spin" />
        </div>
      ) : (
        <section className="mb-12">
          {activeTab === "my" && (
            myCourses.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
                You haven&apos;t been assigned to TA any courses yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myCourses.map((c) => (
                  <Link
                    key={c._id}
                    href={`/dashboard/ta/courses/${c.courseId}`}
                    className="block h-full"
                  >
                    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col h-full hover:border-indigo-500 hover:shadow-sm transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                          <BookMarked className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                          {c.courseId}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-800 leading-snug mb-1">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-500 flex-grow mb-5">
                        Role: Teaching Assistant
                      </p>

                      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-1.5 text-indigo-600 text-xs font-semibold">
                        Manage Submissions <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}

          {activeTab === "browse" && (
            allCourses.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
                No courses found for your department.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {allCourses.map((c) => {
                  const isTA = userId && c.tas && c.tas.includes(userId);
                  const isPending = userId && c.pendingTAs && c.pendingTAs.includes(userId);

                  return (
                    <div key={c._id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col h-full hover:border-indigo-500 hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                          <Search className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                          {c.courseId}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-800 leading-snug mb-1">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-500 flex-grow mb-5">
                        Instructor: {c.instructor?.name || 'Unknown'}
                      </p>

                      <div className="mt-auto pt-3 border-t border-slate-100">
                        {isTA ? (
                          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold py-2 bg-emerald-50 justify-center rounded-lg border border-emerald-100">
                            <CheckCircle className="w-4 h-4" /> Assigned TA
                          </div>
                        ) : isPending ? (
                          <div className="flex items-center gap-2 text-amber-600 text-xs font-bold py-2 bg-amber-50 justify-center rounded-lg border border-amber-100">
                            Request Pending...
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRequestTA(c.courseId)}
                            disabled={requestingId === c.courseId}
                            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-lg transition-colors"
                          >
                            {requestingId === c.courseId ? "Requesting..." : <><PlusCircle className="w-4 h-4" /> Request to TA</>}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </section>
      )}
    </DashboardLayout>
  );
}
