"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { placementAPI, contestAPI } from "@/lib/api";
import { Trophy, Plus, Clock, ExternalLink, X, ChevronLeft, Calendar, Trash2, Timer } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ContestsHub() {
  const router = useRouter();
  
  const [contests, setContests] = useState([]);
  const [upcomingCodeforces, setUpcomingCodeforces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("student");
  const [isTpcCoord, setIsTpcCoord] = useState(false);

  // Contest Modal State
  const [showContestModal, setShowContestModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newContest, setNewContest] = useState({
    title: "", platform: "LeetCode", link: "", contestType: "Global", startTime: "", endTime: "", time: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roleRes, contestRes, upcomingRes] = await Promise.all([
        placementAPI.getPlacementRole(),
        contestAPI.getContests().catch(() => ({ data: { data: [] } })),
        contestAPI.getUpcomingContests().catch(() => ({ data: { data: [] } }))
      ]);

      if (roleRes.data?.data) {
        setRole(roleRes.data.data.placementRole || "student");
        setIsTpcCoord(roleRes.data.data.isTpcCoord || false);
      }

      const raw = contestRes.data?.data || [];
      const sorted = [...raw].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setContests(sorted);

      if (upcomingRes.data?.data) {
        setUpcomingCodeforces(upcomingRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddContest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await contestAPI.addContest({
        title: newContest.title,
        platform: newContest.platform,
        link: newContest.link,
        contestType: newContest.contestType,
        startTime: new Date(newContest.startTime).toISOString(),
        endTime: new Date(newContest.endTime).toISOString(),
        time: newContest.time
      });
      setShowContestModal(false);
      setNewContest({ title: "", platform: "LeetCode", link: "", contestType: "Global", startTime: "", endTime: "", time: "" });
      fetchData(); // Refresh contests
    } catch (err) {
      console.error(err);
      alert("Failed to add contest. Make sure you are a TPC Coordinator.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContest = async (id) => {
    if (confirm("Are you sure you want to delete this contest?")) {
      try {
        await contestAPI.deleteContest(id);
        fetchData();
      } catch (err) {
        console.error("Failed to delete contest", err);
        alert("Failed to delete contest");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
         <button onClick={() => router.push('/dashboard/placements')} className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 text-sm font-semibold mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Placement Hub
         </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
           <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <Trophy className="w-10 h-10 text-amber-500" /> Contest <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Hub</span>
           </h1>
           <p className="text-slate-500 mt-2 text-lg max-w-2xl">Never miss a coding competition. Participate in active hackathons tracked and updated by seniors to keep your problem-solving skills sharp.</p>
        </div>
        {isTpcCoord && (
          <button onClick={() => setShowContestModal(true)} className="bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 whitespace-nowrap flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Post New Contest
          </button>
        )}
      </div>
      {/* UPCOMING GLOBAL CONTESTS (FROM CODEFORCES API) */}
      {!loading && upcomingCodeforces.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Timer className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Global Contest Feed</h2>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md ml-2 flex items-center gap-1">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div> LIVE FEED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {upcomingCodeforces.map((contest, idx) => {
              const contestDate = new Date(contest.startTime);
              const formattedDate = contestDate.toLocaleString(); // User's requested format

              return (
                <a 
                  key={contest.id || idx} 
                  href={contest.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col justify-between min-h-[160px]"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                         contest.platform === 'Codeforces' ? 'bg-red-50 text-red-600' : 
                         contest.platform === 'LeetCode' ? 'bg-amber-50 text-amber-600' : 
                         'bg-emerald-50 text-emerald-600'
                       }`}>
                         {contest.platform}
                       </span>
                       <span className="text-[10px] font-bold text-slate-400">Global API</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                      {contest.name}
                    </h4>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-50">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-indigo-500" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] text-slate-400">Duration: {contest.duration}</span>
                       <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center my-32"><div className="w-10 h-10 rounded-full border-4 border-amber-100 border-t-amber-500 animate-spin"></div></div>
      ) : contests.length === 0 ? (
        upcomingCodeforces.length > 0 ? (
          <div className="bg-white py-8 rounded-3xl border border-dashed border-slate-200 text-center mb-10">
             <p className="text-slate-400 max-w-sm mx-auto font-medium text-sm">No internal college contests have been posted by the TPC yet.</p>
          </div>
        ) : (
          <div className="bg-white py-20 rounded-3xl border border-slate-100 shadow-sm text-center">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-slate-300" />
             </div>
             <h3 className="text-2xl font-bold text-slate-800 mb-2">No upcoming contests</h3>
             <p className="text-slate-500 max-w-sm mx-auto">There are currently no active coding contests on the radar. Check back later!</p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {contests.map((c) => {
              const now = new Date();
              const startDate = new Date(c.startTime);
              const endDate = new Date(c.endTime);
              const isUpcoming = now < startDate;
              const isLive = now >= startDate && now <= endDate;
              const isEnded = now > endDate;

              // Calculate duration
              const durationMs = endDate - startDate;
              const durationHrs = Math.floor(durationMs / (1000 * 60 * 60));
              const durationMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
              const durationStr = durationHrs > 0 ? `${durationHrs}h ${durationMins}m` : `${durationMins}m`;
              
              return (
                <Link key={c._id} href={`/dashboard/placements/contests/${c._id}`} className="block h-full group">
                   <div className={`bg-white p-6 rounded-3xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden h-[280px] flex flex-col ${
                     isLive ? 'border-red-200 hover:border-red-300' : isEnded ? 'border-slate-100 opacity-75 hover:opacity-100 hover:border-slate-200' : 'border-slate-100 hover:border-amber-200'
                   }`}>
                     
                     {isLive && (
                       <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 animate-ping mt-6 mr-6"></div>
                     )}
                     
                     <div className={`absolute top-0 left-0 w-full h-1 transition-all duration-500 ${
                       isLive ? 'bg-gradient-to-r from-red-400 to-orange-500' : isEnded ? 'bg-gradient-to-r from-slate-300 to-slate-200' : 'bg-gradient-to-r from-slate-200 to-slate-100 group-hover:from-amber-400 group-hover:to-orange-500'
                     }`}></div>

                     <div className="flex justify-between items-start mb-4 pt-2">
                        <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-slate-100 group-hover:bg-amber-100 text-slate-500 group-hover:text-amber-700 rounded-full transition-colors">{c.platform}</span>
                        {isLive && <span className="text-[10px] bg-red-50 text-red-600 px-2.5 py-1 rounded-lg border border-red-100 font-black animate-pulse">LIVE NOW</span>}
                        {isUpcoming && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg border border-emerald-100 font-black">UPCOMING</span>}
                        {isEnded && <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-200 font-black">ENDED</span>}
                     </div>

                     <h3 className="text-xl font-bold text-slate-800 leading-tight mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">{c.title}</h3>
                     
                     <div className="mt-auto pt-4 border-t border-slate-50 flex flex-col gap-2 relative">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                           <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" /> 
                           <span className="truncate">{startDate.toLocaleString("en-US", { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-xl pr-14">
                           <Timer className="w-4 h-4 text-blue-500 flex-shrink-0" />
                           <span className="truncate">Duration: {durationStr} · Ends {endDate.toLocaleString("en-US", { hour: 'numeric', minute: 'numeric' })}</span>
                        </div>
                        
                        {isTpcCoord && (
                          <button 
                             onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteContest(c._id); }} 
                             className="absolute bottom-1.5 right-1.5 p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                             title="Delete Contest"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                     </div>
                   </div>
                </Link>
              )
          })}
        </div>
      )}

      {/* MODAL FOR SENIORS TO ADD CONTESTS */}
      {showContestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col border border-white/20">
            <div className="p-6 text-white bg-slate-900 flex justify-between items-center relative overflow-hidden">
               <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-amber-500/30 rounded-full blur-2xl"></div>
               <div className="relative z-10">
                  <h2 className="text-xl font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-400" /> Post New Contest</h2>
                  <p className="text-slate-400 text-xs mt-1">Notify students about upcoming hackathons or contests.</p>
               </div>
               <button onClick={() => setShowContestModal(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors relative z-10">
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <form onSubmit={handleAddContest} className="p-6 bg-slate-50">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Contest Title</label>
                  <input type="text" required value={newContest.title} onChange={e => setNewContest({...newContest, title: e.target.value})} placeholder="e.g. LeetCode Weekly Contest 400" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium shadow-sm" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Platform Name</label>
                  <input type="text" required value={newContest.platform} onChange={e => setNewContest({...newContest, platform: e.target.value})} placeholder="e.g. Codeforces, HackerRank, GeeksforGeeks" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium shadow-sm" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Contest Link</label>
                  <input type="url" required value={newContest.link} onChange={e => setNewContest({...newContest, link: e.target.value})} placeholder="https://..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium shadow-sm" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Contest Type</label>
                  <input type="text" required value={newContest.contestType} onChange={e => setNewContest({...newContest, contestType: e.target.value})} placeholder="e.g. Global, Hiring, Virtual" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium shadow-sm" />
                </div>

                <div>
                   <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Duration (Time)</label>
                   <input type="text" required value={newContest.time} onChange={e => setNewContest({...newContest, time: e.target.value})} placeholder="e.g. 2 hours, 120 mins" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium shadow-sm text-slate-700" />
                 </div>

                <div>
                   <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Start Date & Time</label>
                   <input type="datetime-local" required value={newContest.startTime} onChange={e => setNewContest({...newContest, startTime: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium shadow-sm text-slate-700" />
                 </div>

                 <div>
                   <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">End Date & Time</label>
                   <input type="datetime-local" required value={newContest.endTime} onChange={e => setNewContest({...newContest, endTime: e.target.value})} min={newContest.startTime || undefined} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium shadow-sm text-slate-700" />
                 </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowContestModal(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                   {isSubmitting ? "Posting..." : "Publish Contest"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
