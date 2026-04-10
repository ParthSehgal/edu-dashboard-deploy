"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { placementAPI } from "@/lib/api";
import { Search, Briefcase, Calendar, MapPin, Tag, Code, Trophy, Plus, ChevronRight, Filter } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PlacementsFeed() {
  const router = useRouter();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("student");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const fetchPostsAndRole = async () => {
    setLoading(true);
    try {
      const [roleRes, postsRes] = await Promise.all([
        placementAPI.getPlacementRole(),
        placementAPI.getPosts(searchFilter, tagFilter, yearFilter)
      ]);
      
      if (roleRes.data?.data?.placementRole) setRole(roleRes.data.data.placementRole);
      setPosts(postsRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostsAndRole();
  }, [searchFilter, tagFilter, yearFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchFilter(searchQuery);
  };

  return (
    <DashboardLayout>
      
      {/* SIMPLE & CLEAN HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
           <h1 className="text-4xl font-black text-slate-800 tracking-tight">Placement <span className="text-indigo-600">Hub</span></h1>
           <p className="text-slate-500 mt-2 text-[15px] font-medium max-w-lg">
             Kickstart your career with roadmaps, interview experiences, and real-world tools.
           </p>
        </div>
        
        {/* QUICK ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/placements/contests" className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
             <Trophy className="w-4 h-4" /> Contests
          </Link>
          
          <Link href="/dashboard/placements/mock-oa" className="flex items-center gap-2 bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
             <Briefcase className="w-4 h-4" /> Mock OAs
          </Link>

          {(role === "senior" || role === "alumni") && (
            <Link href="/dashboard/placements/new" className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md">
              <Plus className="w-4 h-4" /> Share Experience
            </Link>
          )}
        </div>
      </div>

      {/* ROADMAPS PLATFORM VIEW (Only 2 Cards - Very Clean) */}
      <div className="mb-14">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-6 flex items-center gap-2">
           Structured Roadmaps
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dashboard/placements/dsa" className="group bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-xl transition-all duration-300 flex overflow-hidden">
             <div className="p-8 pb-8 flex-1 flex flex-col justify-between">
               <div>
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <Code className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">DSA Mastery</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-sm">Master data structures, algorithms, and dynamic programming for technical interviews.</p>
               </div>
               <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  Start Roadmap <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </div>
             </div>
             <div className="w-32 bg-indigo-50 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                <Code className="w-16 h-16 text-indigo-200" />
             </div>
          </Link>
          
          <Link href="/dashboard/placements/development" className="group bg-white rounded-3xl border border-slate-200 hover:border-cyan-300 shadow-sm hover:shadow-xl transition-all duration-300 flex overflow-hidden">
             <div className="p-8 pb-8 flex-1 flex flex-col justify-between">
               <div>
                  <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 mb-5 group-hover:scale-110 group-hover:bg-cyan-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <Code className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-cyan-700 transition-colors">Web Development</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-sm">Build full-stack applications. Explore React, Node, Express, MongoDB, and deployment.</p>
               </div>
               <div className="flex items-center gap-2 text-cyan-600 font-bold text-sm">
                  Start Roadmap <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </div>
             </div>
             <div className="w-32 bg-cyan-50 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                <Code className="w-16 h-16 text-cyan-200" />
             </div>
          </Link>
        </div>
      </div>

      {/* INTELLIGENT EXPERIENCES FILTER */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-6">Interview Database</h2>
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row items-center gap-2 focus-within:border-emerald-300 transition-all">
          
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full bg-slate-50 rounded-xl relative flex items-center">
            <div className="absolute left-4"><Search className="w-4 h-4 text-slate-400" /></div>
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3.5 bg-transparent border-none text-slate-800 outline-none text-sm placeholder:text-slate-400 font-medium"
              placeholder="Search company or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors">
              Find
            </button>
          </form>

          <div className="flex w-full lg:w-auto gap-2">
             <div className="relative flex-1 lg:w-48 bg-slate-50 rounded-xl">
                <div className="absolute left-4 top-1/2 -translate-y-1/2"><Tag className="w-4 h-4 text-slate-400" /></div>
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3.5 bg-transparent border-none text-sm outline-none font-medium placeholder:text-slate-400"
                  placeholder="Filter Topic..."
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                />
             </div>
            <div className="relative w-36 bg-slate-50 rounded-xl">
               <select 
                 className="w-full pl-4 pr-8 py-3.5 bg-transparent text-sm font-semibold outline-none text-slate-700 cursor-pointer appearance-none"
                 value={yearFilter}
                 onChange={(e) => setYearFilter(e.target.value)}
               >
                 <option value="">All Years</option>
                 <option value="2024">Class 2024</option>
                 <option value="2025">Class 2025</option>
                 <option value="2026">Class 2026</option>
                 <option value="2027">Class 2027</option>
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-20"><div className="w-8 h-8 rounded-full border-4 border-slate-100 border-t-emerald-500 animate-spin"></div></div>
      ) : posts.length === 0 ? (
        <div className="bg-white py-16 rounded-3xl border border-slate-200 text-center shadow-sm">
           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-slate-300" />
           </div>
           <h3 className="text-xl font-bold text-slate-800 mb-2">No experiences found</h3>
           <p className="text-slate-500 text-sm max-w-sm mx-auto">Try adjusting your search criteria or tags.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
             <Link key={post._id} href={`/dashboard/placements/${post._id}`} className="block h-full group">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300 flex flex-col h-[280px]">
                  
                  <div className="flex justify-between items-start mb-5">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-700 text-slate-600 rounded-lg transition-colors">{post.metadata.companyName}</span>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded-lg">
                       {post.metadata.packageCTC} LPA
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 leading-snug mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">{post.metadata.jobRole}</h3>
                  <p className="text-xs font-semibold text-slate-400 mb-4 line-clamp-1">By {post.author?.name || 'Anonymous'}</p>

                  <div className="mt-auto border-t border-slate-100 pt-5">
                     <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-3">
                        <Calendar className="w-3.5 h-3.5" /> <span>Batch of {post.metadata.placementYear}</span>
                     </div>
                     {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                           {post.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="text-[10px] uppercase font-bold text-slate-500 bg-slate-50 border border-slate-200/50 px-2.5 py-1 rounded-md">{tag}</span>
                           ))}
                           {post.tags.length > 3 && <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md">+{post.tags.length - 3}</span>}
                        </div>
                     )}
                  </div>
                </div>
             </Link>
          ))}
        </div>
      )}

    </DashboardLayout>
  );
}
