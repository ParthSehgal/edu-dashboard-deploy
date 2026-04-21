"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { alumniAPI } from "@/lib/api";
import {
  Mic2, Tag, ExternalLink, Heart, MessageSquare,
  ChevronLeft, Send, Calendar, Loader2
} from "lucide-react";
import Link from "next/link";

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function TalkCard({ talk, currentUserId, onLike, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isLiked = currentUserId && talk.likes?.some(
    id => id === currentUserId || id?._id === currentUserId || id?.toString() === currentUserId
  );

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    await onComment(talk._id, commentText);
    setCommentText("");
    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {talk.author?.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">{talk.author?.name || "Unknown"}</span>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 rounded-full">Alumni</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>{talk.author?.department}</span>
                <span>·</span>
                <span>{timeAgo(talk.createdAt)}</span>
              </div>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
            <Mic2 className="w-3 h-3" /> TED Talk
          </span>
        </div>

        {/* Title & Body */}
        <h3 className="text-xl font-extrabold text-slate-800 mb-2 leading-tight">{talk.title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-4 whitespace-pre-line">{talk.body}</p>

        {/* Session Details */}
        {talk.sessionLink && talk.dateTime && (
          <div className="flex flex-col gap-2 mb-4 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
            <p className="text-xs font-bold text-purple-700 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Scheduled: {new Date(talk.dateTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
            <a href={talk.sessionLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 w-fit group bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all">
              <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" /> Join Live Session
            </a>
          </div>
        )}

        {/* Date only (no link) */}
        {!talk.sessionLink && talk.dateTime && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl mb-4 w-fit border border-purple-100">
            <Calendar className="w-3.5 h-3.5" /> {new Date(talk.dateTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </div>
        )}

        {/* Tags */}
        {talk.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {talk.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                <Tag className="w-3 h-3" />{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer - Like & Comment */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
          <button
            onClick={() => onLike(talk._id)}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-all ${isLiked ? "text-red-500" : "text-slate-400 hover:text-red-400"}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500" : ""}`} />
            <span>{talk.likes?.length || 0}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-indigo-500 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{talk.comments?.length || 0}</span>
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-slate-50">
            <div className="space-y-3 max-h-56 overflow-y-auto mb-3 pr-1">
              {talk.comments?.length === 0 && (
                <p className="text-sm text-slate-400 italic text-center py-2">No comments yet. Start the conversation!</p>
              )}
              {talk.comments?.map((c, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {c.user?.name?.charAt(0) || "?"}
                  </div>
                  <div className="bg-slate-50 rounded-xl px-3 py-2 flex-1">
                    <p className="text-xs font-bold text-slate-700">{c.user?.name || "User"}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                disabled={submitting}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
              />
              <button type="submit" disabled={submitting || !commentText.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl disabled:opacity-50 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TedTalksPage() {
  const [talks, setTalks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUserId(JSON.parse(storedUser)._id);
    }
    fetchTalks();
  }, []);

  const fetchTalks = async () => {
    setLoading(true);
    try {
      const res = await alumniAPI.getAllTalks();
      // Show only approved TED talks
      setTalks((res.data?.data || []).filter(t => t.type === "tedtalk"));
    } catch (err) {
      console.error("Failed to load TED talks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    try { await alumniAPI.toggleLike(id); fetchTalks(); } catch (err) { console.error(err); }
  };

  const handleComment = async (id, text) => {
    try { await alumniAPI.addComment(id, text); fetchTalks(); } catch (err) { console.error(err); }
  };

  return (
    <DashboardLayout>
      <Link href="/dashboard/placements" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium text-sm transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Placement Hub
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
            <Mic2 className="w-5 h-5 text-purple-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">TED Talks <span className="text-purple-500">from Alumni</span></h1>
        </div>
        <p className="text-slate-500 text-[15px] font-medium max-w-xl ml-[52px]">
          Watch alumni share their career journeys, industry insights, and actionable advice for your placement prep.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : talks.length === 0 ? (
        <div className="bg-white py-20 rounded-3xl border border-slate-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mic2 className="w-9 h-9 text-purple-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No TED talks yet</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">Check back soon — alumni will share industry talks and career insights here.</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl">
          {talks.map(talk => (
            <TalkCard
              key={talk._id}
              talk={talk}
              currentUserId={currentUserId}
              onLike={handleLike}
              onComment={handleComment}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
