"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/lib/api";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    collegeId: "",
    email: "",
    password: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.register(formData.name, formData.collegeId, formData.email, formData.password, formData.role);
      
      // Redirect to login after successful register
      router.push("/");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-slate-800 bg-white">
      <div className="flex-1 hidden lg:flex bg-gradient-to-br from-indigo-50 to-blue-50 items-center justify-center p-12">
        <div className="max-w-xl text-center">
          <h1 className="text-4xl font-extrabold text-indigo-900 mb-6">Create Your Future.</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-12 sm:px-24 lg:px-32 xl:px-48 bg-white border-l border-slate-100">
        <div className="mb-10">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">Join EduDash.</h2>
          <p className="text-slate-500">Sign up locally to start learning or teaching.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Your Role</label>
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {['student', 'ta', 'professor'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r })}
                  className={`flex-1 capitalize py-2.5 text-sm rounded-lg font-medium transition-all ${
                    formData.role === r ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  {r === 'ta' ? 'TA' : r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">College ID</label>
            <input
              type="text"
              value={formData.collegeId}
              onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
              placeholder="e.g. 19BCE1024"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
              placeholder="you@university.edu"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            Log in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
