"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { alumniAPI } from "@/lib/api";
import {
  Building2, Tag, ExternalLink, Heart, MessageSquare,
  ChevronLeft, Send, ArrowUpRight, Loader2
} from "lucide-react";
import Link from "next/link";

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function UpdateCard({ update, currentUserId, onLike, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isLiked = currentUserId && update.likes?.some(
    id => id === currentUserId || id?._id === currentUserId || id?.toString() === currentUserId
  );

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    await onComment(update._id, commentText);
    setCommentText("");
    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {update.author?.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">{update.author?.name || "Unknown"}</span>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 rounded-full">Alumni</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>{update.author?.department}</span>
                <span>·</span>
                <span>{timeAgo(update.createdAt)}</span>
              </div>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
            <Building2 className="w-3 h-3" /> Tech Update
          </span>
        </div>

        {/* Company */}
        {update.company && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl mb-3 w-fit border border-amber-100">
            <Building2 className="w-3.5 h-3.5" /> {update.company}
          </div>
        )}

        {/* Title & Body */}
        <h3 className="text-lg font-extrabold text-slate-800 mb-2 leading-tight">{update.title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-4 whitespace-pre-line">{update.body}</p>

        {/* Tags */}
        {update.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {update.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                <Tag className="w-3 h-3" />{tag}
              </span>
            ))}
          </div>
        )}

        {/* Session link if present */}
        {update.sessionLink && (
          <a href={update.sessionLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 w-fit bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 hover:shadow transition-all mb-4">
            <ExternalLink className="w-4 h-4" /> Open Link <ArrowUpRight className="w-3 h-3" />
          </a>
        )}

        {/* Footer - Like & Comment */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
          <button
            onClick={() => onLike(update._id)}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-all ${isLiked ? "text-red-500" : "text-slate-400 hover:text-red-400"}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500" : ""}`} />
            <span>{update.likes?.length || 0}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-indigo-500 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{update.comments?.length || 0}</span>
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-slate-50">
            <div className="space-y-3 max-h-56 overflow-y-auto mb-3 pr-1">
              {update.comments?.length === 0 && (
                <p className="text-sm text-slate-400 italic text-center py-2">No comments yet. Start the conversation!</p>
              )}
              {update.comments?.map((c, i) => (
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
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
              />
              <button type="submit" disabled={submitting || !commentText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl disabled:opacity-50 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TechUpdatesPage() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setCurrentUserId(parsed._id);
    }
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const res = await alumniAPI.getAllTalks();
      // Show only approved tech updates
      const techUpdates = (res.data?.data || []).filter(t => t.type === "techupdate");
      setUpdates(techUpdates);
    } catch (err) {
      console.error("Failed to load tech updates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    try {
      await alumniAPI.toggleLike(id);
      fetchUpdates();
    } catch (err) { console.error(err); }
  };

  const handleComment = async (id, text) => {
    try {
      await alumniAPI.addComment(id, text);
      fetchUpdates();
    } catch (err) { console.error(err); }
  };

  return (
    <DashboardLayout>
      <Link href="/dashboard/placements" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium text-sm transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Placement Hub
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-amber-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Tech Updates <span className="text-amber-500">from Alumni</span></h1>
        </div>
        <p className="text-slate-500 text-[15px] font-medium max-w-xl ml-[52px]">
          Stay up to date with the latest industry insights and tech news shared by alumni working at top companies.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : updates.length === 0 ? (
        <div className="bg-white py-20 rounded-3xl border border-slate-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-9 h-9 text-amber-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No tech updates yet</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">Check back soon — alumni will share industry insights here.</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl">
          {updates.map(update => (
            <UpdateCard
              key={update._id}
              update={update}
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
