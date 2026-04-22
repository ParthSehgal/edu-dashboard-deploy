"use client";

import { useState, useEffect } from "react";
import { Upload, Clock, CheckCircle2, Bookmark, Calendar, Loader2, Lock } from "lucide-react";
import UploadModal from "./UploadModal";
import { assignmentsAPI } from "@/lib/api";

const isPastDue = (dueDateStr) => dueDateStr && new Date() > new Date(dueDateStr);
const formatDue = (dueDateStr) => {
  if (!dueDateStr) return null;
  return new Date(dueDateStr).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

export default function AssignmentHub() {
  const [activeTab, setActiveTab] = useState("pending");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await assignmentsAPI.getMyAssignments();
        // Map lessons from the API into the shape the UI expects
        const data = (res.data?.data || []).map((lesson) => ({
          id: lesson._id,
          courseId: lesson.courseId,
          courseName: lesson.courseName,
          title: lesson.title,
          description: lesson.description,
          fileUrl: lesson.fileUrl,
          dueDate: lesson.dueDate || null,
          submittedAt: lesson.submittedAt || null,
          score: lesson.score !== undefined ? lesson.score : null,
          status: lesson.status || "pending",
        }));
        setAssignments(data);
      } catch (err) {
        console.error("Failed to fetch assignments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const handleUploadClick = (assignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleUploadComplete = (id, file) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: "submitted", submittedAt: new Date().toISOString() }
          : a
      )
    );
    alert(`Successfully uploaded ${file.name} for ${selectedAssignment.title}`);
  };

  const filteredAssignments = assignments.filter((a) => a.status === activeTab);

  return (
    <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 relative overflow-hidden">
      <div className="absolute left-0 top-0 w-32 h-32 bg-indigo-50 rounded-full -ml-10 -mt-10 blur-3xl opacity-50" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 relative z-10">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Clock className="w-5 h-5" />
            </div>
            Assignments Hub
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium ml-13">Track and submit your course assignments.</p>
        </div>

        <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          {["pending", "submitted", "evaluated"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all capitalize ${
                activeTab === tab
                  ? "bg-white text-indigo-600 shadow-sm border border-indigo-50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mr-3 text-indigo-600" />
          <span className="text-md font-bold">Fetching assignments…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {filteredAssignments.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <Bookmark className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 text-lg font-bold">
                {activeTab === "pending"
                  ? "All caught up! No pending assignments."
                  : `No ${activeTab} assignments to show.`}
              </p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col h-full group border-b-4 border-b-transparent hover:border-b-indigo-500"
              >
                <div className="p-8 flex-grow flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg">
                      {assignment.courseId}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold truncate">
                      {assignment.courseName}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-slate-800 leading-tight mb-3 group-hover:text-indigo-600 transition-colors">
                    {assignment.title}
                  </h3>
                  {assignment.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 font-medium leading-relaxed">{assignment.description}</p>
                  )}

                  <div className="mt-auto">
                    {assignment.dueDate ? (
                      <div className={`flex items-center gap-2 text-xs font-bold rounded-xl px-4 py-2 w-fit border ${
                        isPastDue(assignment.dueDate)
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                      }`}>
                        <Calendar className="w-3.5 h-3.5" />
                        {isPastDue(assignment.dueDate)
                          ? `Deadline Passed`
                          : `Due ${formatDue(assignment.dueDate)}`
                        }
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                        <Calendar className="w-3.5 h-3.5" /> No Deadline
                      </div>
                    )}

                    {activeTab === "submitted" && (
                      <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
                        <Clock className="w-3.5 h-3.5" />
                        Submitted {new Date(assignment.submittedAt).toLocaleDateString()}
                      </div>
                    )}

                    {activeTab === "evaluated" && (
                      <div className="mt-4 flex items-center gap-2 text-sm font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 w-fit">
                        <CheckCircle2 className="w-4 h-4" />
                        Score: {assignment.score ?? "—"}/100
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-8 pb-8">
                  {activeTab === "pending" && (
                    isPastDue(assignment.dueDate) ? (
                      <div className="w-full bg-slate-50 text-slate-400 text-xs font-black py-3 rounded-2xl flex items-center justify-center gap-2 grayscale border border-slate-100">
                        <Lock className="w-4 h-4" />
                        SUBMISSION CLOSED
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUploadClick(assignment)}
                        className="w-full bg-slate-900 hover:bg-indigo-600 text-white text-sm font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200 hover:shadow-indigo-200 active:scale-95"
                      >
                        <Upload className="w-4 h-4" />
                        UPLOAD WORK
                      </button>
                    )
                  )}
                  
                  {activeTab !== "pending" && (
                     <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-full" />
                     </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assignment={selectedAssignment}
        onUpload={handleUploadComplete}
      />
    </div>
  );
}
