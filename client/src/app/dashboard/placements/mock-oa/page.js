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
  const [isTpcCoord, setIsTpcCoord] = useState(false);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newOA, setNewOA] = useState({
    title: "", studentsText: ""
  });

  const [selectedOA, setSelectedOA] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roleRes, oaRes] = await Promise.all([
        placementAPI.getPlacementRole(),
        mockOaAPI.getOAs().catch(() => ({ data: { data: [] } }))
      ]);
      if (roleRes.data?.data) {
        setRole(roleRes.data.data.placementRole || "student");
        setIsTpcCoord(roleRes.data.data.isTpcCoord || false);
      }
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
      const studentsToUpload = newOA.studentsText.split("\n").filter(line => line.trim() !== "").map(line => {
         const parts = line.split("-");
         return {
            name: parts[0] ? parts[0].trim() : "Unknown",
            rollNo: parts[1] ? parts[1].trim() : "N/A"
         };
      });

      await mockOaAPI.addOA({
        title: newOA.title,
        students: studentsToUpload
      });
      setShowCreateModal(false);
      setNewOA({ title: "", studentsText: "" });
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add Mock OA Result. Please try again.");
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
             <Briefcase className="w-10 h-10 text-violet-500" /> Mock OA <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">Results</span>
           </h1>
           <p className="text-slate-500 mt-2 text-lg max-w-2xl">View results and performance outcomes of simulated online assessments curated by seniors.</p>
        </div>
        {(role === "senior" || isTpcCoord) && (
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
           <h3 className="text-2xl font-bold text-slate-800 mb-2">No Mock OA Results available</h3>
           <p className="text-slate-500 max-w-sm mx-auto">There are currently no mock assessment results to show.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {oas.map((oa) => {
              return (
                <div key={oa._id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col">
                   
                   {/* Subtle top indicator */}
                   <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-400 to-fuchsia-500"></div>

                   <h3 className="text-2xl font-bold text-slate-800 leading-tight mb-4 pt-2">{oa.title}</h3>
                   
                   <div className="mt-4 border-t border-slate-100 pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Students Selected for Interview
                        </h4>
                        {(role === "senior" || isTpcCoord) && (
                           <button onClick={() => handleDeleteOA(oa._id)} className="text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-2">
                              <Trash2 className="w-4 h-4" /> Delete Result
                           </button>
                        )}
                      </div>
                      
                      <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-sm">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                              <th className="px-4 py-3 font-bold text-slate-600">Name</th>
                              <th className="px-4 py-3 font-bold text-slate-600">Roll Number</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {oa.selectedStudents.length === 0 ? (
                              <tr>
                                <td colSpan="2" className="px-4 py-8 text-center text-slate-400 italic bg-white">No candidates listed.</td>
                              </tr>
                            ) : (
                              oa.selectedStudents.map((s, idx) => (
                                <tr key={idx} className="bg-white hover:bg-slate-50 transition-colors">
                                  <td className="px-4 py-3 font-semibold text-slate-700">{s.name}</td>
                                  <td className="px-4 py-3"><span className="px-2 py-1 bg-violet-50 text-violet-600 rounded-lg text-xs font-black uppercase tracking-wider">{s.rollNo}</span></td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
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
                   <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Mock OA Title</label>
                   <input type="text" required value={newOA.title} onChange={e => setNewOA({...newOA, title: e.target.value})} placeholder="e.g. Amazon SDET Mock OA Result" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-medium shadow-sm" />
                 </div>
 
                 <div>
                    <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 mb-2">
                       <p className="text-[11px] text-violet-700 font-medium">Format candidates line by line:<br/><strong className="text-violet-900">John Doe - 2401AI54</strong></p>
                    </div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Selected Students</label>
                    <textarea required value={newOA.studentsText} onChange={e => setNewOA({...newOA, studentsText: e.target.value})} placeholder="Student Name - Roll No..." className="w-full h-48 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-medium shadow-sm resize-none"></textarea>
                 </div>
               </div>
               
               <div className="flex gap-3 mt-8">
                 <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                 <button type="submit" disabled={isSubmitting} className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                    {isSubmitting ? "Publishing..." : "Publish Result"}
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}


    </DashboardLayout>
  );
}
