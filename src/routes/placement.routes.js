const express = require("express");
const router = express.Router();

const { test, getMyPlacementRole } = require("../controllers/placement.controller");
const { protect } = require("../middleware/auth.middleware");
const { restrictToSenior } = require("../middleware/placement.middleware");

const {
  createPost,
  editPost,
  publishPost,
  deletePost,
  toggleUpvote,
  toggleBookmark,
  getMyPosts,
  getPublishedPosts,
  getPostById
} = require("../controllers/placementPost.controller");

const {
  createComment,
  toggleCommentUpvote,
  getCommentsTree
} = require("../controllers/comment.controller");

// Public — just to test module is working
router.get("/test", test);

// Protected — returns placement role of logged in user
router.get("/me", protect, getMyPlacementRole);

// ==========================================
// Placement Dashboard Routes
// ==========================================

// Global Read & Engagement (All roles)
router.get("/posts", protect, getPublishedPosts);
router.get("/posts/:id", protect, getPostById);
router.post("/posts/:id/upvote", protect, toggleUpvote);
router.post("/posts/:id/bookmark", protect, toggleBookmark);

// Creator Routes (Seniors/Alumni only)
router.post("/posts", protect, restrictToSenior, createPost);
router.get("/posts/me", protect, restrictToSenior, getMyPosts);
router.put("/posts/:id", protect, restrictToSenior, editPost);
router.patch("/posts/:id/publish", protect, restrictToSenior, publishPost);
router.delete("/posts/:id", protect, restrictToSenior, deletePost);

// Comments Discussion Thread
router.get("/posts/:postId/comments", protect, getCommentsTree);
router.post("/posts/:postId/comments", protect, createComment);
router.put("/comments/:commentId/upvote", protect, toggleCommentUpvote);

module.exports = router;
