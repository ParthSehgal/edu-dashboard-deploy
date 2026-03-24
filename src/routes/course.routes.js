const express = require("express");
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { createCourse, getCourses, enrollInCourse, updateCourse,deleteCourse,getMyCourses } = require("../controllers/course.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

router.get("/", getCourses);
router.post("/", protect, restrictTo("professor"), createCourse);

// Professor Dashboard Route
router.get("/my-courses", protect, restrictTo("professor"), getMyCourses);

// ... parameter routes go below ...
// Get Single Course
router.get('/:id', courseController.getSingleCourse);
// Update Course
router.put("/:id", protect, restrictTo("professor"), updateCourse);
// Delete Course
router.delete("/:id", protect, restrictTo("professor"), deleteCourse);
// Enroll in Course
router.post("/:id/enroll", protect, restrictTo("student"), enrollInCourse);

module.exports = router;