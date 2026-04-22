const Comment = require("../models/comment.model");
const { success } = require("../utils/apiResponse");

exports.createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, parentComment } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const comment = await Comment.create({
      content,
      author: req.user.id || req.user._id,
      post: postId,
      parentComment: parentComment || null
    });

    return success(res, "Comment created", comment);
  } catch (error) {
    next(error);
  }
};

// 2. Toggle Upvote
exports.toggleCommentUpvote = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      const error = new Error("Comment not found");
      error.statusCode = 404;
      throw error;
    }

    const userId = req.user.id || req.user._id;
    const index = comment.upvotes.indexOf(userId);

    if (index === -1) {
      comment.upvotes.push(userId);
    } else {
      comment.upvotes.splice(index, 1);
    }

    await comment.save();
    return success(res, "Comment upvote toggled", { upvotes: comment.upvotes.length });
  } catch (error) {
    next(error);
  }
};

// 3. Fetch comments as assembled Tree
exports.getCommentsTree = async (req, res, next) => {
  try {
    const { postId } = req.params;

    // Fetch flat array from DB
    const comments = await Comment.find({ post: postId })
      .populate("author", "name collegeId") // Populate author details
      .lean(); // Use lean() for plain JS objects so we can mutate easily

    if (!comments.length) {
      return success(res, "Comments fetched", []);
    }

    // O(n) Hash Map for Tree Assembly
    const map = {};
    const tree = [];

    // Initialize mapping and empty replies array for each comment
    for (const comment of comments) {
      comment.replies = [];
      map[comment._id.toString()] = comment;
    }

    // Build the tree
    for (const comment of comments) {
      if (comment.parentComment) {
        // It's a reply
        const parentId = comment.parentComment.toString();
        // If parent exists in our map, push to its replies.
        // Otherwise (maybe deleted parent), push to top-level just in case or skip.
        if (map[parentId]) {
          map[parentId].replies.push(comment);
        } else {
          tree.push(comment); // Fallback for orphaned replies
        }
      } else {
        // It's a top-level comment
        tree.push(comment);
      }
    }

    return success(res, "Comments fetched", tree);
  } catch (error) {
    next(error);
  }
};
