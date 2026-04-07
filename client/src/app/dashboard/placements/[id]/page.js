"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { placementAPI } from "@/lib/api";
import { Bookmark, ThumbsUp, Calendar, Building, Landmark, Tag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import CommentThread from "@/components/Placement/CommentThread";

export default function PostDetailView({ params }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchPost = async () => {
    try {
      const p = await Promise.resolve(params);
      const res = await placementAPI.getPostById(p.id);
      setPost(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [params]);

  const handleUpvote = async () => {
    try {
      await placementAPI.toggleUpvote(post._id);
      fetchPost(); // refresh counts
      setRefreshKey(r => r + 1); // visually tell comments to refresh if they depend on global state, though here they dont
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async () => {
    try {
      await placementAPI.toggleBookmark(post._id);
      fetchPost();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <DashboardLayout><div className="flex justify-center mt-20"><div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div></div></DashboardLayout>;
  if (!post) return <DashboardLayout><div className="mt-20 text-center text-slate-500 font-medium">Post not found.</div></DashboardLayout>;

  const currentUserId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem('user'))?._id : null;
  const isUpvoted = post.engagement?.upvotes?.includes(currentUserId);
  const isBookmarked = post.engagement?.bookmarks?.includes(currentUserId);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto w-full">
        <Link href="/dashboard/placements" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </Link>
        
        {/* Post Header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 relative overflow-hidden mb-8">
           <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Building className="w-40 h-40 text-indigo-900" />
           </div>
           
           <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                 <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-full border border-indigo-100 uppercase tracking-wide">
                    {post.metadata.companyName}
                 </span>
                 <span className="px-4 py-1.5 bg-green-50 text-green-700 text-sm font-bold rounded-full border border-green-100">
                    {post.metadata.packageCTC} LPA
                 </span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">{post.metadata.jobRole}</h1>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6 text-sm text-slate-600 border-t border-slate-100 pt-6">
                 <div className="flex items-center gap-2"><Landmark className="w-4 h-4 text-slate-400" /> By {post.author?.name || 'Anonymous'}</div>
                 <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> Class of {post.metadata.placementYear}</div>
                 <div className="flex items-center gap-2"><Tag className="w-4 h-4 text-slate-400" /> {post.tags?.join(", ")}</div>
              </div>
           </div>
        </div>

        {/* Action Bar */}
        <div className="flex gap-4 mb-8">
           <button 
             onClick={handleUpvote} 
             className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition border ${isUpvoted ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
           >
             <ThumbsUp className={`w-5 h-5 ${isUpvoted ? 'fill-current' : ''}`} /> 
             {isUpvoted ? 'Upvoted' : 'Upvote'} ({post.engagement?.upvotes?.length || 0})
           </button>
           <button 
             onClick={handleBookmark}
             className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition border ${isBookmarked ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
           >
             <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} /> 
             {isBookmarked ? 'Saved' : 'Save'} ({post.engagement?.bookmarks?.length || 0})
           </button>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-10">
           {/* Rounds */}
           {post.content?.rounds?.length > 0 && (
             <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm">⚔️</span>
                  Interview Rounds
                </h2>
                <div className="space-y-6">
                   {post.content.rounds.map((round, index) => (
                      <div key={index} className="pl-6 border-l-2 border-indigo-100 relative">
                         <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-2 border-2 border-white"></div>
                         <h3 className="text-xl font-bold text-slate-800 mb-3">{round.roundName}</h3>
                         {/* Render HTML Safely (Sanitized on Backend already!) */}
                         <div className="prose prose-slate max-w-none text-slate-600 prose-p:leading-relaxed" dangerouslySetInnerHTML={{ __html: round.details }}></div>
                      </div>
                   ))}
                </div>
             </div>
           )}

           {/* General Tips */}
           {post.content?.tips && (
             <div className="bg-blue-50/50 p-6 md:p-8 rounded-2xl border border-blue-100">
                <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">💡 Additional Tips & Advice</h2>
                <div className="prose prose-blue max-w-none text-blue-800/80" dangerouslySetInnerHTML={{ __html: post.content.tips }}></div>
             </div>
           )}
        </div>

        {/* Threaded Comments via Recursive Tree Component */}
        <CommentThread postId={post._id} refreshKey={refreshKey} />
      </div>
    </DashboardLayout>
  );
}
