const express = require("express");
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { createCourse, getCourses, getSingleCourse, enrollInCourse, updateCourse,deleteCourse,getMyCourses } = require("../controllers/course.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");
const { searchStudents } = require("../controllers/search.controller");


// Public
router.get("/", getCourses);

// Professor only
router.post("/", protect, restrictTo("professor"), createCourse);
router.get("/my", protect, restrictTo("professor"), getMyCourses);
router.put("/:id", protect, restrictTo("professor"), updateCourse);
router.delete("/:id", protect, restrictTo("professor"), deleteCourse);

// Any logged-in user (student, ta, professor can all search)
router.get("/:id/students/search", protect, searchStudents);

// Student only
router.post("/:id/enroll", protect, restrictTo("student"), enrollInCourse);

// Single course — public
router.get("/:id", getSingleCourse);

module.exports = router;