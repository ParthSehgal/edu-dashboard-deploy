"use client";

import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { placementAPI, contestAPI, userAPI } from "@/lib/api";
import { Trophy, Clock, ExternalLink, ChevronLeft, Calendar, MessageSquare, Send, Trash2, Timer, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ContestDetails({ params }) {
  const router = useRouter();
  const id = params.contestId;
  
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState("student");
  const [isTpcCoord, setIsTpcCoord] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [contestStatus, setContestStatus] = useState("upcoming"); // upcoming | live | ended
  const timerRef = useRef(null);

  const fetchContest = async () => {
    try {
      const [res, roleRes, userRes] = await Promise.all([
        contestAPI.getContestById(id),
        placementAPI.getPlacementRole().catch(() => ({ data: { data: {} } })),
        userAPI.getMe().catch(() => ({ data: { data: null } }))
      ]);

      if (res.data?.success) {
        setContest(res.data.data);
      }
      if (roleRes.data?.data) {
        setRole(roleRes.data.data.placementRole || "student");
        setIsTpcCoord(roleRes.data.data.isTpcCoord || false);
      }
      if (userRes.data?.data) {
        setCurrentUser(userRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContest();
  }, [id]);

  // Countdown timer effect
  useEffect(() => {
    if (!contest) return;

    const updateTimer = () => {
      const now = new Date();
      const start = new Date(contest.startTime);
      const end = new Date(contest.endTime);

      if (now < start) {
        // Upcoming: count down to start
        setContestStatus("upcoming");
        const diff = start - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        if (days > 0) {
          setTimeLeft(`${days}d ${hrs}h ${mins}m ${secs}s`);
        } else {
          setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
        }
      } else if (now >= start && now <= end) {
        // Live: count down to end
        setContestStatus("live");
        const diff = end - now;
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
      } else {
        // Ended
        setContestStatus("ended");
        setTimeLeft("Contest has ended");
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [contest]);

  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await contestAPI.addContestDiscussion(id, message);
      if (res.data?.success) {
        setContest(res.data.data); // It returns the updated contest
        setMessage("");
      }
    } catch (err) {
      console.error("Failed to post message", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContest = async () => {
    if (confirm("Are you sure you want to delete this contest?")) {
      try {
        await contestAPI.deleteContest(id);
        router.push('/dashboard/placements/contests');
      } catch (err) {
        console.error("Failed to delete contest", err);
        alert("Failed to delete contest");
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center my-32"><div className="w-10 h-10 rounded-full border-4 border-amber-100 border-t-amber-500 animate-spin"></div></div>
      </DashboardLayout>
    );
  }

  if (!contest) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-slate-800">Contest not found</h2>
          <button onClick={() => router.push('/dashboard/placements/contests')} className="mt-4 text-indigo-600 font-semibold hover:underline">Return to Contests</button>
        </div>
      </DashboardLayout>
    );
  }

  const startDate = new Date(contest.startTime);
  const endDate = new Date(contest.endTime);
  const durationMs = endDate - startDate;
  const durationHrs = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const durationStr = durationHrs > 0 ? `${durationHrs}h ${durationMins}m` : `${durationMins}m`;

  return (
    <DashboardLayout>
      <div className="mb-6">
         <button onClick={() => router.push('/dashboard/placements/contests')} className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 text-sm font-semibold mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Contests
         </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="h-4 bg-gradient-to-r from-amber-400 to-orange-500"></div>
        <div className="p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                 <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-amber-100 text-amber-700 rounded-full">{contest.platform}</span>
                 {contest.contestType && <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-blue-100 text-blue-700 rounded-full">{contest.contestType}</span>}
                 {contestStatus === "live" && <span className="text-[10px] bg-red-50 text-red-600 px-2.5 py-1 rounded-lg border border-red-100 font-black animate-pulse">LIVE NOW</span>}
                 {contestStatus === "upcoming" && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg border border-emerald-100 font-black">UPCOMING</span>}
                 {contestStatus === "ended" && <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-200 font-black">ENDED</span>}
               </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 leading-tight">{contest.title}</h1>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              {isTpcCoord && (
                <button 
                  onClick={handleDeleteContest}
                  className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-4 rounded-2xl font-bold transition-all hover:-translate-y-1 flex items-center justify-center border border-red-200"
                  title="Delete Contest"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <a href={contest.link} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 flex items-center gap-2 whitespace-nowrap justify-center">
                Enter Contest <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Countdown Timer Banner */}
           <div className={`p-4 rounded-2xl border flex items-center gap-4 mb-6 ${
             contestStatus === "live" ? 'bg-red-50 border-red-200' : contestStatus === "upcoming" ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
           }`}>
             <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
               contestStatus === "live" ? 'bg-red-100 text-red-600' : contestStatus === "upcoming" ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
             }`}>
               {contestStatus === "live" ? <Zap className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
             </div>
             <div>
               <p className={`text-xs font-bold uppercase tracking-wider ${
                 contestStatus === "live" ? 'text-red-500' : contestStatus === "upcoming" ? 'text-emerald-500' : 'text-slate-500'
               }`}>
                 {contestStatus === "live" ? "Time Remaining" : contestStatus === "upcoming" ? "Starts In" : "Status"}
               </p>
               <p className={`text-xl font-extrabold tracking-tight ${
                 contestStatus === "live" ? 'text-red-700' : contestStatus === "upcoming" ? 'text-emerald-700' : 'text-slate-600'
               }`}>
                 {timeLeft}
               </p>
             </div>
           </div>

           <div className="flex flex-wrap items-center gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                 <Calendar className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time</p>
                 <p className="font-semibold text-slate-800">{startDate.toLocaleString("en-US", { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</p>
               </div>
             </div>
             
             <div className="h-10 w-px bg-slate-200 hidden md:block"></div>

             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                 <Clock className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Time</p>
                 <p className="font-semibold text-slate-800">{endDate.toLocaleString("en-US", { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</p>
               </div>
             </div>
             
             <div className="h-10 w-px bg-slate-200 hidden md:block"></div>

             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</p>
                  <p className="font-semibold text-slate-800">{contest.time || durationStr}</p>
                </div>
             </div>
             
             <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
             
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Added By</p>
                  <p className="font-semibold text-slate-800">{contest.addedBy?.name || "Senior"}</p>
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* Discussion Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-800">Contest Discussion</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {(!contest.discussions || contest.discussions.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-medium">No messages yet. Be the first to discuss this contest!</p>
            </div>
          ) : (
            contest.discussions.map((msg, idx) => {
              const isMine = currentUser && msg.user && (msg.user._id === currentUser._id || msg.user === currentUser._id);
              
              return (
                <div key={idx} className={`flex gap-4 ${isMine ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm ${isMine ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'}`}>
                    {msg.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className={`flex flex-col w-full max-w-[80%] ${isMine ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 rounded-2xl shadow-sm flex flex-col gap-1 relative w-full ${isMine ? 'bg-indigo-600 text-white rounded-tr-sm border border-indigo-700' : 'bg-white text-slate-800 rounded-tl-sm border border-slate-100'}`}>
                       <div className={`flex justify-between items-end gap-4 border-b pb-2 mb-2 ${isMine ? 'border-indigo-500' : 'border-slate-50'}`}>
                         <span className={`font-bold text-sm ${isMine ? 'text-white' : 'text-slate-800'}`}>{isMine ? "You" : (msg.user?.name || "Student")}</span>
                         <span className={`text-[11px] font-medium ${isMine ? 'text-indigo-200' : 'text-slate-400'}`}>{new Date(msg.createdAt).toLocaleString()}</span>
                       </div>
                       <p className={`text-[15px] leading-relaxed whitespace-pre-wrap ${isMine ? 'text-white' : 'text-slate-600'}`}>{msg.message}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handlePostMessage} className="flex gap-3 relative">
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Discuss strategy, ask for teammates, or share resources..." 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium pr-16"
              disabled={isSubmitting}
            />
            <button 
              type="submit" 
              disabled={isSubmitting || !message.trim()}
              className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white w-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
