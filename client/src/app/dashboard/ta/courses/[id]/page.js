"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { coursesAPI, assignmentsAPI } from "@/lib/api";
import { Search, Users, Calendar, ArrowLeft, CheckCircle, Award, Download, Loader2, MessageSquare, Star, Clock, ChevronDown, ChevronUp, X } from "lucide-react";
import Link from "next/link";
import GradesManager from "@/components/Dashboard/Professor/GradesManager";

// ── Evaluate Modal ────────────────────────────────────────────────
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
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2"><Award className="w-5 h-5" /> Evaluate Submission</h2>
            <p className="text-indigo-200 text-sm mt-1">{submission.student?.name} — {submission.assignmentTitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Score <span className="text-slate-400 font-normal normal-case">(0 – 100)</span></label>
            <input
              type="number" min={0} max={100} value={score}
              onChange={e => setScore(e.target.value)}
              placeholder="e.g. 85"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-2xl font-bold text-slate-800"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Feedback <span className="text-slate-400 font-normal normal-case">(optional)</span></label>
            <textarea
              rows={4} value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Good work! Consider improving..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
            />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><CheckCircle className="w-4 h-4" /> Save Marks</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Submission Row ─────────────────────────────────────────────────
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
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {sub.student?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">{sub.student?.name}</p>
              <p className="text-xs text-slate-500">{sub.assignmentTitle} · {sub.student?.collegeId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEvaluated ? (
              <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-lg border border-emerald-200">
                <Star className="w-3 h-3" /> {sub.evaluatedScore}/100
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-2 py-1 rounded-lg border border-amber-200">
                <Clock className="w-3 h-3" /> Pending
              </span>
            )}
            {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>

        {open && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3" onClick={e => e.stopPropagation()}>
            <p className="text-xs text-slate-400">Submitted {new Date(sub.createdAt).toLocaleString()}</p>
            {sub.feedback && (
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3">
                <p className="text-xs font-bold text-indigo-700 flex items-center gap-1 mb-1"><MessageSquare className="w-3 h-3" /> Feedback</p>
                <p className="text-sm text-slate-700">{sub.feedback}</p>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              {sub.fileUrl && (
                <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download Submission
                </a>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setShowEval(true); }}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border transition-colors ${isEvaluated ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-violet-600 text-white border-violet-600 hover:bg-violet-700"}`}
              >
                <Award className="w-3.5 h-3.5" /> {isEvaluated ? "Update Marks" : "Give Marks"}
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

export default function TACourseDetail({ params }) {
  const [course, setCourse] = useState(null);
  const [courseCode, setCourseCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  const fetchCourse = async (cid) => {
    try {
      const res = await coursesAPI.getCourse(cid);
      setCourse(res.data.data);
    } catch (err) { console.error(err); }
  };

  const loadSubmissions = async (cid) => {
    setLoadingSubmissions(true);
    try {
      const subRes = await assignmentsAPI.getSubmissions(cid);
      setSubmissions(subRes.data.data || []);
    } catch (err) { console.error(err); }
    setLoadingSubmissions(false);
  };

  useEffect(() => {
    const run = async () => {
      try {
        const p = await Promise.resolve(params);
        setCourseCode(p.id);
        await fetchCourse(p.id);
        await loadSubmissions(p.id);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    run();
  }, [params]);

  useEffect(() => {
    if (!searchQuery.trim() || !courseCode) { setSearchResults([]); return; }
    const timer = setTimeout(() => handleSearch(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, courseCode]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || !courseCode) return;
    setSearching(true);
    try {
      const res = await coursesAPI.searchStudents(courseCode, searchQuery);
      const data = res.data.data || [];
      setSearchResults(data);
      if (data.length === 0 && res.data.debug) window.lastSearchDebug = res.data.debug;
    } catch (err) {
      console.error(err);
      alert("Trie Error: " + (err.response?.data?.message || err.message));
    } finally { setSearching(false); }
  };

  if (loading) return <DashboardLayout requiredRole="ta"><div className="flex justify-center mt-20"><div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" /></div></DashboardLayout>;
  if (!course) return <DashboardLayout requiredRole="ta"><div className="mt-20 text-center text-slate-500">Course not found.</div></DashboardLayout>;

  const evaluated = submissions.filter(s => s.evaluatedScore !== null && s.evaluatedScore !== undefined);

  return (
    <DashboardLayout requiredRole="ta">
      <Link href="/dashboard/ta" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-50 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 mb-4">{course.courseId}</span>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">{course.title}</h1>
          <p className="text-slate-600 max-w-3xl mb-2">{course.description}</p>
          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
            <span><span className="font-bold text-slate-700">{submissions.length}</span> total submissions</span>
            <span><span className="font-bold text-emerald-600">{evaluated.length}</span> evaluated</span>
            <span><span className="font-bold text-amber-600">{submissions.length - evaluated.length}</span> pending</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
              <Calendar className="w-5 h-5 text-indigo-500" /> All Submissions
            </h2>

            {loadingSubmissions ? (
              <div className="flex justify-center py-12 text-slate-400"><Loader2 className="w-6 h-6 animate-spin mr-2" /><span>Loading submissions…</span></div>
            ) : submissions.length === 0 ? (
              <div className="text-slate-500 border border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50">No student submissions found.</div>
            ) : (
              <div className="space-y-3">
                {submissions.map(sub => (
                  <SubmissionRow
                    key={sub._id}
                    sub={sub}
                    courseCode={courseCode}
                    onRefresh={() => loadSubmissions(courseCode)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-1 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-4">
              <Users className="w-5 h-5 text-indigo-500" /> Enrolled Students
            </h2>
            <p className="text-sm text-slate-500 mb-4">Trie Search Engine enabled. Total: {course.students?.length}</p>

            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Prefix search (e.g. 'tan')"
                  className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button type="submit" disabled={searching}
                  className="absolute right-1 top-1 bottom-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg text-xs font-medium transition-colors">
                  {searching ? '...' : 'Search'}
                </button>
              </div>
            </form>

            <div className="max-h-64 overflow-y-auto pr-2">
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Results</h3>
                  {searchResults.map(st => (
                    <div key={st._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{st.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-none">{st.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{st.collegeId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                searchQuery && !searching && (
                  <div className="text-center p-4 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl text-sm">
                    No students matched &apos;{searchQuery}&apos;.
                  </div>
                )
              )}
            </div>

            {!searchQuery && course.students && course.students.map(st => (
              <div key={st._id} className="flex items-center justify-between p-3 border-b last:border-0 border-slate-100">
                <p className="text-sm font-medium text-slate-700">{st.name}</p>
                <p className="text-xs text-slate-500">{st.collegeId || st.email}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <GradesManager course={course} isPublished={course.gradesPublished} onCourseUpdated={() => fetchCourse(courseCode)} userRole="ta" />
      </div>
    </DashboardLayout>
  );
}
