const express = require("express");
const router = express.Router({ mergeParams: true });
const { submitAssignment, getSubmissionsForCourse, evaluateSubmission } = require("../controllers/submission.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

// POST /api/courses/:courseId/submissions — students submit
router.post("/", protect, restrictTo("student"), upload.single("file"), submitAssignment);

// GET /api/courses/:courseId/submissions — professors & TAs view
router.get("/", protect, restrictTo("professor", "ta"), getSubmissionsForCourse);

// PATCH /api/courses/:courseId/submissions/:submissionId/evaluate — TA or Prof evaluates
router.patch("/:submissionId/evaluate", protect, restrictTo("professor", "ta"), evaluateSubmission);

module.exports = router;