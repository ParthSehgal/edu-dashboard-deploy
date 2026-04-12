const express = require("express");
const router = express.Router();
const {
  getAllTalks,
  getTalkById,
  createTedTalk,
  createTechUpdate,
  toggleLike,
  addComment,
  deleteTalk
} = require("../controllers/alumni.controller");
const { protect } = require("../middleware/auth.middleware");
const { attachPlacementRole } = require("../middleware/placement.middleware");

// All routes require authentication
router.use(protect);
router.use(attachPlacementRole); // attaches req.placementRole (senior/student/alumni)

// Public feed (any authenticated user)
router.get("/talks", getAllTalks);
router.get("/talks/:id", getTalkById);

// Create posts
router.post("/talks/ted-talk", createTedTalk);        // alumni only
router.post("/talks/tech-update", createTechUpdate);  // alumni + seniors

// Engagement
router.post("/talks/:id/like", toggleLike);
router.post("/talks/:id/comment", addComment);

// Delete (author only)
router.delete("/talks/:id", deleteTalk);

module.exports = router;
