"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { assignmentsAPI, coursesAPI } from "@/lib/api";
import {
  ArrowLeft, Download, CheckCircle2, Clock, Star,
  FileText, User, MessageSquare, Award, Loader2, ChevronDown, ChevronUp
} from "lucide-react";
import Link from "next/link";

function EvaluateModal({ submission, courseCode, onClose, onSaved }) {
  const [score, setScore] = useState(submission.evaluatedScore ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    const parsed = Number(score);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      setError("Score must be a number between 0 and 100.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await assignmentsAPI.evaluateSubmission(courseCode, submission._id, parsed, feedback);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save evaluation.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Award className="w-5 h-5" /> Evaluate Submission
          </h2>
          <p className="text-indigo-200 text-sm mt-1">
            {submission.student?.name} — {submission.assignmentTitle}
          </p>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Score <span className="text-slate-400 font-normal normal-case">(0 – 100)</span>
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={e => setScore(e.target.value)}
              placeholder="e.g. 85"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-2xl font-bold text-slate-800"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Feedback <span className="text-slate-400 font-normal normal-case">(optional)</span>
            </label>
            <textarea
              rows={4}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Good work! Consider improving..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
            />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><CheckCircle2 className="w-4 h-4" /> Save Evaluation</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SubmissionRow({ sub, courseCode, onRefresh }) {
  const [open, setOpen] = useState(false);
  const [showEval, setShowEval] = useState(false);
  const isEvaluated = sub.evaluatedScore !== null && sub.evaluatedScore !== undefined;

  return (
    <>
      <div
        className={`border rounded-xl p-5 transition-all cursor-pointer ${isEvaluated ? "border-emerald-100 bg-emerald-50/30" : "border-slate-100 hover:bg-slate-50"}`}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {sub.student?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-800">{sub.student?.name}</p>
              <p className="text-xs text-slate-500">{sub.student?.collegeId} · {sub.student?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEvaluated ? (
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-1 rounded-lg border border-emerald-200">
                <Star className="w-3.5 h-3.5" /> {sub.evaluatedScore}/100
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-lg border border-amber-200">
                <Clock className="w-3.5 h-3.5" /> Pending Evaluation
              </span>
            )}
            {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>

        {open && (
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Submitted</p>
                <p className="text-sm font-medium text-slate-700">{new Date(sub.createdAt).toLocaleString()}</p>
              </div>
              {isEvaluated && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Evaluated By</p>
                  <p className="text-sm font-medium text-slate-700">{sub.evaluatedBy?.name || "—"}</p>
                </div>
              )}
            </div>

            {sub.feedback && (
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                  <MessageSquare className="w-3.5 h-3.5" /> Feedback
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">{sub.feedback}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              {sub.fileUrl && (
                <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg border border-indigo-100 transition-colors">
                  <Download className="w-4 h-4" /> Download Submission
                </a>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setShowEval(true); }}
                className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg border transition-colors ${isEvaluated ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-violet-600 text-white border-violet-600 hover:bg-violet-700"}`}
              >
                <Award className="w-4 h-4" /> {isEvaluated ? "Update Marks" : "Give Marks"}
              </button>
            </div>
          </div>
        )}
      </div>

      {showEval && (
        <EvaluateModal
          submission={sub}
          courseCode={courseCode}
          onClose={() => setShowEval(false)}
          onSaved={onRefresh}
        />
      )}
    </>
  );
}

export default function AssignmentDashboard({ params }) {
  const [courseCode, setCourseCode] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const p = await Promise.resolve(params);
      const cid = p.id;
      const title = decodeURIComponent(p.assignmentTitle);
      setCourseCode(cid);
      setAssignmentTitle(title);
      await loadSubmissions(cid, title);
    };
    run();
  }, [params]);

  const loadSubmissions = async (cid, title) => {
    setLoading(true);
    try {
      const res = await assignmentsAPI.getSubmissions(cid);
      const all = res.data?.data || [];
      // Filter to only this assignment
      const filtered = all.filter(s => s.assignmentTitle === title);
      // Ensure evaluatedBy is populated — re-fetch if needed
      setSubmissions(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const evaluated = submissions.filter(s => s.evaluatedScore !== null && s.evaluatedScore !== undefined);
  const pending = submissions.filter(s => s.evaluatedScore === null || s.evaluatedScore === undefined);
  const avgScore = evaluated.length ? (evaluated.reduce((a, s) => a + s.evaluatedScore, 0) / evaluated.length).toFixed(1) : null;

  return (
    <DashboardLayout requiredRole="professor">
      <Link href={`/dashboard/professor/courses/${courseCode}`} className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Course
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-8 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-indigo-100 to-violet-50 rounded-full blur-3xl opacity-60" />
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 mb-3">{courseCode}</span>
          <h1 className="text-2xl font-extrabold text-slate-800 mb-1 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" /> {assignmentTitle}
          </h1>
          <p className="text-slate-500 text-sm">Assignment Submissions Dashboard</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Submissions", value: submissions.length, color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
          { label: "Evaluated", value: evaluated.length, color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
          { label: "Pending", value: pending.length, color: "bg-amber-50 text-amber-700 border-amber-100" },
          { label: "Avg Score", value: avgScore ? `${avgScore}/100` : "—", color: "bg-violet-50 text-violet-700 border-violet-100" },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl border p-5 ${stat.color}`}>
            <p className="text-3xl font-black">{stat.value}</p>
            <p className="text-xs font-semibold mt-1 opacity-70 uppercase tracking-wide">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
          <User className="w-5 h-5 text-indigo-500" /> Student Submissions
        </h2>

        {loading ? (
          <div className="flex justify-center py-16 text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin mr-2" /><span>Loading submissions…</span>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400">
            No submissions received for this assignment yet.
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map(sub => (
              <SubmissionRow
                key={sub._id}
                sub={sub}
                courseCode={courseCode}
                onRefresh={() => loadSubmissions(courseCode, assignmentTitle)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
