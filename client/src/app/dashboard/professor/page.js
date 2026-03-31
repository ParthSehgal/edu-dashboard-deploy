"use client";

import DashboardLayout from "@/components/Layout/DashboardLayout";
import { useEffect, useState } from "react";
import { BookOpen, Users, FilePlus } from "lucide-react";
import { coursesAPI } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfessorDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    setLoading(true);
    try {
      const res = await coursesAPI.getMyCourses();
      setCourses(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await coursesAPI.createCourse({ courseId, title, description });
      alert("Course created successfully!");
      setShowCreateForm(false);
      setCourseId("");
      setTitle("");
      setDescription("");
      fetchCourses();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to create course");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout requiredRole="professor">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Professor Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your courses and assignments.</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <FilePlus className="w-4 h-4" />
          {showCreateForm ? 'Cancel Creation' : 'Create Course'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-8 mb-8 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600"></div>
          <h2 className="text-xl font-bold text-slate-800 mb-6">Create New Course</h2>
          <form onSubmit={handleCreateCourse} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Code (e.g. CS101)</label>
                <input 
                  type="text" 
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                  required 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                rows="3"
                required
              ></textarea>
            </div>
            <div className="flex justify-end pt-2">
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
              >
                {submitting ? 'Creating...' : 'Publish Course'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{courses.length}</h3>
            <p className="text-sm text-slate-500 font-medium">Your Courses</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-slate-800 mb-4">Your Courses</h2>
      {loading ? (
        <div className="flex justify-center my-12"><div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div></div>
      ) : courses.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center border shadow-sm mb-10 text-slate-500">
          You haven't created any courses yet. Click "Create Course" to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <Link key={c._id} href={`/dashboard/professor/courses/${c.courseId}`} className="block">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">{c.courseId}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{c.title}</h3>
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-auto pt-4 border-t border-slate-50">
                  <Users className="w-4 h-4" />
                  <span>{c.students?.length || 0} Students Enrolled</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
