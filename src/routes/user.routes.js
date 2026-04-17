const express = require("express");
const router = express.Router();

const { 
  getAllUsers, 
  deleteUser,
  getMe,
  updateProfile,
  updatePassword,
  getTranscript,
  getCourseArchive,
  updateCRStatus
} = require("../controllers/user.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

// Logged in user routes
router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);
router.put("/me/password", protect, updatePassword);
router.get("/me/transcript", protect, getTranscript);
router.get("/me/faculty-profile", protect, restrictTo("professor"), getMe); // alias with full data
router.get("/me/course-archive", protect, restrictTo("professor"), getCourseArchive);

// Admin / Prof / TA routes
router.get("/", protect, restrictTo("professor", "ta"), getAllUsers);
router.delete("/:id", protect, restrictTo("admin", "professor"), deleteUser);
router.put("/:id/cr", protect, restrictTo("professor"), updateCRStatus);

module.exports = router;