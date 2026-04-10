"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { mockOaAPI, placementAPI } from "@/lib/api";
import { Briefcase, Plus, Clock, ExternalLink, X, ChevronLeft, Calendar, FileText, CheckCircle2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MockOAHackathonHub() {
  const router = useRouter();
  
  const [oas, setOas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("student");

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newOA, setNewOA] = useState({
    title: "", syllabus: "", date: ""
  });

  // Upload Results Modal State
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedOA, setSelectedOA] = useState(null);
  const [resultsText, setResultsText] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roleRes, oaRes] = await Promise.all([
        placementAPI.getPlacementRole(),
        mockOaAPI.getOAs().catch(() => ({ data: { data: [] } }))
      ]);
      
      if (roleRes.data?.data?.placementRole) setRole(roleRes.data.data.placementRole);
      setOas(oaRes.data?.data || []);
    } catch (err) {
      console.error("Failed fetching OAs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddOA = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await mockOaAPI.addOA({
        title: newOA.title,
        syllabus: newOA.syllabus,
        date: new Date(newOA.date).toISOString()
      });
      setShowCreateModal(false);
      setNewOA({ title: "", syllabus: "", date: "" });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to add Mock OA. Only seniors have this authorization.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadResults = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Parse the results text simple line-by-line formatting: "Student Name - 2401AI54"
      const studentsToUpload = resultsText.split("\\n").filter(line => line.trim() !== "").map(line => {
         const parts = line.split("-");
         return {
            name: parts[0] ? parts[0].trim() : "Unknown",
            rollNo: parts[1] ? parts[1].trim() : "N/A"
         };
      });

      await mockOaAPI.uploadResults(selectedOA._id, { students: studentsToUpload });
      setShowResultsModal(false);
      setSelectedOA(null);
      setResultsText("");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to upload results.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOA = async (id) => {
    if (confirm("Are you sure you want to delete this Mock OA?")) {
      try {
        await mockOaAPI.deleteOA(id);
        fetchData();
      } catch (err) {
        console.error("Failed to delete OA", err);
        alert("Failed to delete OA");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
         <button onClick={() => router.push('/dashboard/placements')} className="text-slate-500 hover:text-violet-600 flex items-center gap-1 text-sm font-semibold mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Placement Hub
         </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
           <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <Briefcase className="w-10 h-10 text-violet-500" /> Mock <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">OAs</span>
           </h1>
           <p className="text-slate-500 mt-2 text-lg max-w-2xl">Participate in simulated online assessments curated by seniors based on real company patterns.</p>
        </div>
        {role === "senior" && (
          <button onClick={() => setShowCreateModal(true)} className="bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 whitespace-nowrap flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Create Assessment
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center my-32"><div className="w-10 h-10 rounded-full border-4 border-violet-100 border-t-violet-500 animate-spin"></div></div>
      ) : oas.length === 0 ? (
        <div className="bg-white py-20 rounded-3xl border border-slate-100 shadow-sm text-center">
           <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-slate-300" />
           </div>
           <h3 className="text-2xl font-bold text-slate-800 mb-2">No Mock OAs scheduled</h3>
           <p className="text-slate-500 max-w-sm mx-auto">There are currently no mock assessments active. Relax for now!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {oas.map((oa) => {
             const oaDate = new Date(oa.date);
             const isPast = oaDate < new Date();
             
             return (
               <div key={oa._id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col">
                  
                  {/* Subtle top indicator */}
                  <div className={`absolute top-0 left-0 w-full h-1.5 ${isPast ? 'bg-slate-200' : 'bg-gradient-to-r from-violet-400 to-fuchsia-500'}`}></div>

                  <div className="flex justify-between items-start mb-6 pt-2">
                     <span className="text-xs font-black uppercase tracking-wider px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg">{isPast ? 'Completed' : 'Upcoming'}</span>
                     <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                        <Calendar className="w-4 h-4" /> 
                        {oaDate.toLocaleString("en-US", { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                     </div>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-800 leading-tight mb-4">{oa.title}</h3>
                  
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6 flex-1">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3"><FileText className="w-4 h-4" /> Syllabus & Rules</h4>
                     <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{oa.syllabus}</p>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-6 mt-auto">
                     {oa.resultsUploaded ? (
                        <div>
                           <div className="flex justify-between items-center mb-4">
                             <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Students Selected</h4>
                             {role === "senior" && (
                                <button onClick={() => handleDeleteOA(oa._id)} className="text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl transition-colors shadow-sm flex items-center justify-center">
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             )}
                           </div>
                           <div className="flex flex-wrap gap-2">
                              {oa.selectedStudents.length === 0 ? (
                                 <span className="text-sm text-slate-500 italic">No candidates selected.</span>
                              ) : (
                                 oa.selectedStudents.map((s, idx) => (
                                    <div key={idx} className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                                       <span>{s.name}</span>
                                       <span className="text-[10px] text-emerald-500/80 uppercase px-1.5 bg-emerald-100 rounded">{s.rollNo}</span>
                                    </div>
                                 ))
                              )}
                           </div>
                        </div>
                     ) : (
                        <div className="flex items-center justify-between">
                           <span className="text-sm text-slate-500 font-medium italic">Results not yet declared.</span>
                           {role === "senior" && (
                              <div className="flex gap-2">
                                <button onClick={() => { setSelectedOA(oa); setShowResultsModal(true); }} className="text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl transition-colors shadow-md">
                                   Upload Results
                                </button>
                                <button onClick={() => handleDeleteOA(oa._id)} className="text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-xl transition-colors shadow-md flex items-center justify-center">
                                   <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               </div>
             )
          })}
        </div>
      )}

      {/* CREATE OA MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col border border-white/20">
            <div className="p-6 text-white bg-slate-900 flex justify-between items-center relative overflow-hidden">
               <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-violet-500/30 rounded-full blur-2xl"></div>
               <div className="relative z-10">
                  <h2 className="text-xl font-bold flex items-center gap-2"><Briefcase className="w-5 h-5 text-violet-400" /> Create Mock OA</h2>
                  <p className="text-slate-400 text-xs mt-1">Schedule an assessment and define the syllabus.</p>
               </div>
               <button onClick={() => setShowCreateModal(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors relative z-10">
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <form onSubmit={handleAddOA} className="p-6 bg-slate-50">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Title</label>
                  <input type="text" required value={newOA.title} onChange={e => setNewOA({...newOA, title: e.target.value})} placeholder="e.g. Amazon Deep-Dive Mock OA 1" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-medium shadow-sm" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Date & Time</label>
                  <input type="datetime-local" required value={newOA.date} onChange={e => setNewOA({...newOA, date: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-medium shadow-sm text-slate-700" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Syllabus & Rules</label>
                  <textarea required value={newOA.syllabus} onChange={e => setNewOA({...newOA, syllabus: e.target.value})} placeholder="e.g. Arrays, Strings, DP. No internet allowed." className="w-full h-32 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-medium shadow-sm resize-none"></textarea>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                   {isSubmitting ? "Creating..." : "Publish Assessment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD RESULTS MODAL */}
      {showResultsModal && selectedOA && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col border border-white/20">
            <div className="p-6 text-white bg-emerald-900 flex justify-between items-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/30 rounded-full blur-2xl"></div>
               <div className="relative z-10">
                  <h2 className="text-xl font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Upload Results</h2>
                  <p className="text-emerald-100/70 text-xs mt-1">Declare selected candidates for {selectedOA.title}</p>
               </div>
               <button onClick={() => {setShowResultsModal(false); setSelectedOA(null);}} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors relative z-10">
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <form onSubmit={handleUploadResults} className="p-6 bg-slate-50">
              <div>
                 <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4">
                    <p className="text-xs text-emerald-700 font-medium">Format your entries line by line like this:<br/><strong className="text-emerald-900">John Doe - 2401AI54</strong><br/><strong className="text-emerald-900">Jane Smith - 2401AI44</strong></p>
                 </div>
                 <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Selected Students</label>
                 <textarea required value={resultsText} onChange={e => setResultsText(e.target.value)} placeholder="John Doe - 2401CB33..." className="w-full h-48 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium shadow-sm resize-none"></textarea>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => {setShowResultsModal(false); setSelectedOA(null);}} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/30 disabled:opacity-50">
                   {isSubmitting ? "Uploading..." : "Publish Results"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
