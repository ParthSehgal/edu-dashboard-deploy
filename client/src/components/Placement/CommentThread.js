"use client";

import { useState, useEffect } from "react";
import { placementAPI } from "@/lib/api";
import { CornerDownRight, ThumbsUp, Send } from "lucide-react";

// Recursive Comment Component
const CommentNode = ({ comment, depth = 0, onReplyAdded, onUpvoteToggled }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Default max indentation visual limit
  const indentClass = depth > 0 ? "ml-4 md:ml-8 border-l border-slate-200 pl-4 mt-4" : "mt-6";

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    setSubmitting(true);
    try {
      await placementAPI.addComment(comment.post, replyContent, comment._id);
      setReplyContent("");
      setShowReplyBox(false);
      onReplyAdded(); // Trigger refresh
    } catch (err) {
      console.error("Failed to add reply", err);
      alert(err.response?.data?.message || "Failed to post reply.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentUserId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem('user'))?._id : null;
  const isUpvoted = comment.upvotes.includes(currentUserId);

  return (
    <div className={`${indentClass}`}>
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative group">
        <div className="flex justify-between items-start mb-2">
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700">
                {comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : 'U'}
             </div>
             <p className="text-sm font-semibold text-slate-800">{comment.author?.name || 'Anonymous'}</p>
             <span className="text-[10px] text-slate-400">&bull; {new Date(comment.createdAt).toLocaleDateString()}</span>
           </div>
        </div>
        
        <p className="text-sm text-slate-600 mb-3 whitespace-pre-wrap">{comment.content}</p>
        
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
           <button 
              onClick={() => onUpvoteToggled(comment._id)} 
              className={`flex items-center gap-1.5 transition-colors hover:text-indigo-600 ${isUpvoted ? 'text-indigo-600' : ''}`}
           >
             <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-current' : ''}`} /> {comment.upvotes.length}
           </button>
           <button 
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="flex items-center gap-1.5 hover:text-slate-800 transition-colors"
           >
             <CornerDownRight className="w-3.5 h-3.5" /> Reply
           </button>
        </div>
      </div>

      {showReplyBox && (
        <form onSubmit={handleReplySubmit} className="mt-3 flex gap-2 pl-4">
          <textarea 
            className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[40px] resize-none"
            placeholder="Write a reply..."
            rows={1}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={submitting}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Render children recursively */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies-container">
          {comment.replies.map(child => (
             <CommentNode 
               key={child._id} 
               comment={child} 
               depth={depth + 1} 
               onReplyAdded={onReplyAdded}
               onUpvoteToggled={onUpvoteToggled}
             />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CommentThread({ postId, refreshKey }) {
  const [commentsTree, setCommentsTree] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [topLevelContent, setTopLevelContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await placementAPI.getComments(postId);
      setCommentsTree(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, refreshKey]); // re-fetch if external prop triggers it

  const handleTopLevelSubmit = async (e) => {
    e.preventDefault();
    if (!topLevelContent.trim()) return;

    setSubmitting(true);
    try {
      await placementAPI.addComment(postId, topLevelContent);
      setTopLevelContent("");
      fetchComments();
    } catch (err) {
      console.error("Top level reply failed", err);
      alert(err.response?.data?.message || "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvoteToggle = async (commentId) => {
    try {
      await placementAPI.toggleCommentUpvote(commentId);
      // Re-fetch to update exactly. (If it gets slow, we could optimistic update)
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 md:p-8 mt-12 w-full max-w-4xl mx-auto shadow-sm">
       <h3 className="text-xl font-bold text-slate-800 mb-6">Discussion</h3>

       {/* Top level add comment */}
       <form onSubmit={handleTopLevelSubmit} className="mb-10 flex gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold shrink-0">
             {typeof window !== "undefined" ? (JSON.parse(localStorage.getItem('user'))?.name?.charAt(0) || 'U') : 'U'}
          </div>
          <div className="flex-1">
            <textarea 
              className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
              placeholder="What are your thoughts?"
              value={topLevelContent}
              onChange={(e) => setTopLevelContent(e.target.value)}
            />
            <div className="flex justify-end mt-2">
               <button 
                 type="submit" 
                 disabled={submitting || !topLevelContent.trim()}
                 className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
               >
                 {submitting ? 'Posting...' : 'Post Comment'}
               </button>
            </div>
          </div>
       </form>

       <div className="space-y-2">
          {loading ? (
             <div className="text-center py-4 text-slate-400">Loading comments...</div>
          ) : commentsTree.length === 0 ? (
             <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-xl">
               No comments yet. Be the first to start the discussion!
             </div>
          ) : (
             commentsTree.map(comment => (
               <CommentNode 
                 key={comment._id} 
                 comment={comment} 
                 onReplyAdded={fetchComments}
                 onUpvoteToggled={handleUpvoteToggle}
               />
             ))
          )}
       </div>
    </div>
  );
}
