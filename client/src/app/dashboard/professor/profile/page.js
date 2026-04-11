"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { facultyAPI } from "@/lib/api";
import {
  User, GraduationCap, Building2, Globe, BookOpen,
  Clock, MapPin, Edit3, Save, X, Lock, Bell, BellOff,
  ChevronRight, ExternalLink, Book, Bookmark,
  Users, Calendar, Plus, Trash2, Eye, EyeOff, CheckCircle, AlertCircle
} from "lucide-react";

// ── Google Scholar SVG icon (no lucide equivalent) ─────────────────────
const ScholarIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
    <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

// ── Absolute URL helper ────────────────────────────────────────────────
const absoluteUrl = (url) => {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

// ── Toggle switch component ─────────────────────────────────────────────
const Toggle = ({ enabled, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
        enabled ? "bg-indigo-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
    <span className="text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
  </label>
);

// ── Section card wrapper ────────────────────────────────────────────────
const Section = ({ title, icon: Icon, children, action }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="px-7 py-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
      <h2 className="font-semibold text-slate-800 flex items-center gap-2.5 text-base">
        <Icon className="w-4.5 h-4.5 text-indigo-500" size={18} />
        {title}
      </h2>
      {action}
    </div>
    <div className="p-7">{children}</div>
  </div>
);

// ── Field label + value display ────────────────────────────────────────
const Field = ({ label, value, placeholder = "Not set" }) => (
  <div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-sm ${value ? "text-slate-800" : "text-slate-400 italic"}`}>{value || placeholder}</p>
  </div>
);

// ── Toast notification ─────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium transition-all animate-in slide-in-from-bottom-3 ${
    type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
  }`}>
    {type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
    {message}
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
      <X className="w-4 h-4" />
    </button>
  </div>
);


// ══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
export default function ProfessorProfilePage() {
  const [profile, setProfile] = useState(null);
  const [archive, setArchive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Edit modes
  const [editingHeader, setEditingHeader] = useState(false);
  const [editingAcademic, setEditingAcademic] = useState(false);
  const [editingOffice, setEditingOffice] = useState(false);

  // Header form state
  const [headerForm, setHeaderForm] = useState({ name: "", academicTitle: "", department: "" });

  // Academic form state
  const [academicForm, setAcademicForm] = useState({
    bio: "", researchInterests: [], scholarLink: "", personalWebsite: "",
    socialLinks: { linkedin: "" }
  });
  const [newResearchTag, setNewResearchTag] = useState("");

  // Office form state
  const [officeForm, setOfficeForm] = useState({ officeLocation: "", officeHours: [] });

  // Password form state
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState({
    taGradeSubmit: true,
    weeklyPerformanceSummary: true
  });
  const [savingNotifs, setSavingNotifs] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Load data ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, archiveRes] = await Promise.all([
          facultyAPI.getProfile(),
          facultyAPI.getCourseArchive()
        ]);
        const p = profileRes.data.data;
        setProfile(p);
        setArchive(archiveRes.data.data || []);

        // Seed form states
        setHeaderForm({ name: p.name || "", academicTitle: p.academicTitle || "", department: p.department || "" });
        setAcademicForm({
          bio: p.bio || "",
          researchInterests: p.researchInterests || [],
          scholarLink: p.scholarLink || "",
          personalWebsite: p.personalWebsite || "",
          socialLinks: { linkedin: p.socialLinks?.linkedin || "" }
        });
        setOfficeForm({
          officeLocation: p.officeLocation || "",
          officeHours: p.officeHours?.length ? p.officeHours : [{ day: "Monday", from: "10:00 AM", to: "12:00 PM" }]
        });
        setNotifications(p.notifications || { taGradeSubmit: true, weeklyPerformanceSummary: true });
      } catch (err) {
        console.error(err);
        showToast("Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Save helpers ──────────────────────────────────────────────────────
  const saveSection = async (payload, onSuccess) => {
    setSaving(true);
    try {
      const res = await facultyAPI.updateProfile(payload);
      setProfile(res.data.data);
      onSuccess?.();
      showToast("Saved successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveHeader = () => saveSection(
    { name: headerForm.name, academicTitle: headerForm.academicTitle },
    () => setEditingHeader(false)
  );

  const saveAcademic = () => saveSection(
    {
      bio: academicForm.bio,
      researchInterests: academicForm.researchInterests,
      scholarLink: academicForm.scholarLink,
      personalWebsite: academicForm.personalWebsite,
      socialLinks: academicForm.socialLinks
    },
    () => setEditingAcademic(false)
  );

  const saveOffice = () => saveSection(
    { officeLocation: officeForm.officeLocation, officeHours: officeForm.officeHours },
    () => setEditingOffice(false)
  );

  const saveNotifications = async (updated) => {
    setSavingNotifs(true);
    try {
      await facultyAPI.updateProfile({ notifications: updated });
      setNotifications(updated);
      showToast("Notifications updated!");
    } catch {
      showToast("Failed to update notifications", "error");
    } finally {
      setSavingNotifs(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      showToast("Passwords do not match", "error");
      return;
    }
    setChangingPw(true);
    try {
      await facultyAPI.changePassword(pwForm.oldPassword, pwForm.newPassword);
      showToast("Password updated successfully!");
      setPwForm({ oldPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update password", "error");
    } finally {
      setChangingPw(false);
    }
  };

  // ── Office hours helpers ───────────────────────────────────────────────
  const addOfficeHourRow = () =>
    setOfficeForm(f => ({
      ...f,
      officeHours: [...f.officeHours, { day: "Monday", from: "09:00 AM", to: "11:00 AM" }]
    }));

  const removeOfficeHourRow = (i) =>
    setOfficeForm(f => ({ ...f, officeHours: f.officeHours.filter((_, idx) => idx !== i) }));

  const updateOfficeHourRow = (i, field, value) =>
    setOfficeForm(f => ({
      ...f,
      officeHours: f.officeHours.map((row, idx) => idx === i ? { ...row, [field]: value } : row)
    }));

  // ── Research interest tag helpers ──────────────────────────────────────
  const addResearchTag = (e) => {
    if (e.key === "Enter" && newResearchTag.trim()) {
      e.preventDefault();
      setAcademicForm(f => ({ ...f, researchInterests: [...f.researchInterests, newResearchTag.trim()] }));
      setNewResearchTag("");
    }
  };
  const removeResearchTag = (i) =>
    setAcademicForm(f => ({ ...f, researchInterests: f.researchInterests.filter((_, idx) => idx !== i) }));

  // ────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout requiredRole="professor">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Initials for avatar
  const initials = (profile?.name || "P").split(" ").filter(w => w).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "P";

  return (
    <DashboardLayout requiredRole="professor">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ──────────────────────────────────────────────────────────────── */}
      {/* SECTION 1: Faculty Header / Identity */}
      {/* ──────────────────────────────────────────────────────────────── */}
      <div className="relative mb-8 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        {/* Banner gradient */}
        <div className="h-36 bg-gradient-to-r from-indigo-900 via-indigo-700 to-blue-800" />

        {/* Profile content */}
        <div className="bg-white px-8 pb-7">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 mb-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-lg border-4 border-white shrink-0">
              {initials}
            </div>

            {/* Identity info — view mode */}
            {!editingHeader ? (
              <div className="flex-1 pt-12 sm:pt-0 sm:pb-1">
                <h1 className="text-2xl font-bold text-slate-900 leading-tight">{profile?.name}</h1>
                <p className="text-indigo-600 font-semibold text-sm mt-0.5">{profile?.academicTitle || "Professor"}</p>
                <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {profile?.department} Department · {profile?.email}
                </div>
              </div>
            ) : (
              /* Edit header form */
              <div className="flex-1 pt-12 sm:pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Full Name</label>
                  <input
                    value={headerForm.name}
                    onChange={e => setHeaderForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Academic Title</label>
                  <input
                    value={headerForm.academicTitle}
                    onChange={e => setHeaderForm(f => ({ ...f, academicTitle: e.target.value }))}
                    placeholder="e.g. Associate Professor"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Edit / Save buttons */}
            <div className="flex gap-2 pt-12 sm:pt-0 sm:pb-1 shrink-0">
              {!editingHeader ? (
                <button
                  onClick={() => setEditingHeader(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setEditingHeader(false)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button
                    onClick={saveHeader}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
                  >
                    <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick stats strip */}
          <div className="flex flex-wrap gap-6 pt-5 border-t border-slate-100">
            <div className="text-center">
              <div className="text-xl font-black text-slate-800">{archive.length}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Courses Taught</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-slate-800">
                {archive.reduce((sum, c) => sum + (c.totalStudents || 0), 0)}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-slate-800">{profile?.researchInterests?.length || 0}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Research Areas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column (wide) ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SECTION 2A: Academic Profile  */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Section
            title="Academic Profile"
            icon={Book}
            action={
              !editingAcademic ? (
                <button
                  onClick={() => setEditingAcademic(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 bg-white rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditingAcademic(false)} className="text-xs px-3 py-1.5 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                  <button onClick={saveAcademic} disabled={saving} className="text-xs px-3 py-1.5 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60">
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              )
            }
          >
            {!editingAcademic ? (
              <div className="space-y-6">
                {/* Bio */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Biography</p>
                  <p className={`text-sm leading-relaxed ${profile?.bio ? "text-slate-700" : "text-slate-400 italic"}`}>
                    {profile?.bio || "No biography added yet."}
                  </p>
                </div>

                {/* Research interests */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Research Interests</p>
                  {profile?.researchInterests?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.researchInterests.map((interest, i) => (
                        <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-medium">
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-sm">No research interests listed.</p>
                  )}
                </div>

                {/* External links */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">External Links</p>
                  <div className="flex flex-wrap gap-3">
                    {profile?.scholarLink ? (
                      <a href={absoluteUrl(profile.scholarLink)} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all">
                        <ScholarIcon className="w-4 h-4 text-blue-600" /> Google Scholar <ExternalLink className="w-3 h-3 opacity-50 ml-1" />
                      </a>
                    ) : null}
                    {profile?.socialLinks?.linkedin ? (
                      <a href={absoluteUrl(profile.socialLinks.linkedin)} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all">
                        <LinkedinIcon className="w-4 h-4 text-blue-700" /> LinkedIn <ExternalLink className="w-3 h-3 opacity-50 ml-1" />
                      </a>
                    ) : null}
                    {profile?.personalWebsite ? (
                      <a href={absoluteUrl(profile.personalWebsite)} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-all">
                        <Globe className="w-4 h-4 text-slate-500" /> Personal Website <ExternalLink className="w-3 h-3 opacity-50 ml-1" />
                      </a>
                    ) : null}
                    {!profile?.scholarLink && !profile?.socialLinks?.linkedin && !profile?.personalWebsite && (
                      <p className="text-slate-400 italic text-sm">No external links added.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Academic edit form */
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Biography</label>
                  <textarea
                    value={academicForm.bio}
                    onChange={e => setAcademicForm(f => ({ ...f, bio: e.target.value }))}
                    rows={5}
                    placeholder="Write a short academic biography..."
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
                    Research Interests <span className="text-slate-400 normal-case">(press Enter to add)</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {academicForm.researchInterests.map((t, i) => (
                      <span key={i} className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-medium">
                        {t}
                        <button onClick={() => removeResearchTag(i)} className="ml-1 text-indigo-400 hover:text-indigo-700">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    value={newResearchTag}
                    onChange={e => setNewResearchTag(e.target.value)}
                    onKeyDown={addResearchTag}
                    placeholder="e.g. Machine Learning"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Google Scholar URL</label>
                    <input value={academicForm.scholarLink} onChange={e => setAcademicForm(f => ({ ...f, scholarLink: e.target.value }))}
                      placeholder="https://scholar.google.com/..."
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">LinkedIn URL</label>
                    <input value={academicForm.socialLinks.linkedin} onChange={e => setAcademicForm(f => ({ ...f, socialLinks: { linkedin: e.target.value } }))}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Personal Website</label>
                    <input value={academicForm.personalWebsite} onChange={e => setAcademicForm(f => ({ ...f, personalWebsite: e.target.value }))}
                      placeholder="https://yoursite.edu"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SECTION 3: Teaching Archive */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Section title="Teaching Archive" icon={Bookmark}>
            {archive.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p>No courses found in your teaching history.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-7 -mb-7">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                      <th className="text-left pl-7 py-3.5 font-semibold">Course ID</th>
                      <th className="text-left py-3.5 font-semibold">Course Name</th>
                      <th className="text-left py-3.5 font-semibold hidden sm:table-cell">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Period</span>
                      </th>
                      <th className="text-left py-3.5 font-semibold pr-7">
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Students</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {archive.map((course, i) => (
                      <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                        <td className="pl-7 py-4">
                          <span className="font-mono text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">
                            {course.courseId}
                          </span>
                        </td>
                        <td className="py-4 font-medium text-slate-800 pr-4">{course.title}</td>
                        <td className="py-4 text-slate-500 hidden sm:table-cell">{course.semester}</td>
                        <td className="py-4 pr-7">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            {course.totalStudents}
                            <span className="text-slate-400 text-xs">enrolled</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>

        {/* ── Right column (narrow) ── */}
        <div className="flex flex-col gap-6">

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SECTION 2B: Office Hours */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Section
            title="Office & Hours"
            icon={MapPin}
            action={
              !editingOffice ? (
                <button onClick={() => setEditingOffice(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 bg-white rounded-lg hover:bg-indigo-50">
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditingOffice(false)} className="text-xs px-3 py-1.5 text-slate-600 border border-slate-200 rounded-lg">Cancel</button>
                  <button onClick={saveOffice} disabled={saving} className="text-xs px-3 py-1.5 text-white bg-indigo-600 rounded-lg disabled:opacity-60">
                    {saving ? "…" : "Save"}
                  </button>
                </div>
              )
            }
          >
            {!editingOffice ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Location</p>
                    <p className={`text-sm font-medium ${profile?.officeLocation ? "text-slate-800" : "text-slate-400 italic"}`}>
                      {profile?.officeLocation || "Not set"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Weekly Hours
                  </p>
                  {profile?.officeHours?.length ? (
                    <div className="space-y-2">
                      {profile.officeHours.map((h, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                          <span className="font-semibold text-slate-700">{h.day}</span>
                          <span className="text-slate-500 text-xs">{h.from} – {h.to}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-sm">No office hours set.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Office Location</label>
                  <input
                    value={officeForm.officeLocation}
                    onChange={e => setOfficeForm(f => ({ ...f, officeLocation: e.target.value }))}
                    placeholder="e.g. Room 404, CS Building"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Office Hours</label>
                  <div className="space-y-2.5">
                    {officeForm.officeHours.map((row, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <select
                          value={row.day}
                          onChange={e => updateOfficeHourRow(i, "day", e.target.value)}
                          className="w-1/3 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          {DAYS.map(d => <option key={d}>{d}</option>)}
                        </select>
                        <input placeholder="From" value={row.from} onChange={e => updateOfficeHourRow(i, "from", e.target.value)}
                          className="w-1/3 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
                        <input placeholder="To" value={row.to} onChange={e => updateOfficeHourRow(i, "to", e.target.value)}
                          className="w-1/3 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
                        <button onClick={() => removeOfficeHourRow(i)} className="text-red-400 hover:text-red-600 shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={addOfficeHourRow}
                    className="mt-3 flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add slot
                  </button>
                </div>
              </div>
            )}
          </Section>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SECTION 4A: Notification Toggles */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Section title="Notifications" icon={Bell}>
            <div className="space-y-4">
              <Toggle
                enabled={notifications.taGradeSubmit}
                label="Email me when a TA submits grades"
                onChange={(v) => {
                  const updated = { ...notifications, taGradeSubmit: v };
                  saveNotifications(updated);
                }}
              />
              <div className="border-t border-slate-100 pt-4">
                <Toggle
                  enabled={notifications.weeklyPerformanceSummary}
                  label="Receive weekly class performance summaries"
                  onChange={(v) => {
                    const updated = { ...notifications, weeklyPerformanceSummary: v };
                    saveNotifications(updated);
                  }}
                />
              </div>
            </div>
          </Section>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SECTION 4B: Change Password */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Section title="Security" icon={Lock}>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {[
                { key: "oldPassword", label: "Current Password" },
                { key: "newPassword", label: "New Password" },
                { key: "confirm", label: "Confirm New Password" }
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">{label}</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={pwForm[key]}
                      onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                      required
                      className="w-full px-3 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    {key === "confirm" && (
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="submit"
                disabled={changingPw}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {changingPw ? "Updating…" : "Update Password"}
              </button>
            </form>
          </Section>

        </div>
      </div>
    </DashboardLayout>
  );
}
