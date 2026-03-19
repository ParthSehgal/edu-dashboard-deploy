const express = require("express");
const router = express.Router();

const { createCourse, getCourses } = require("../controllers/course.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/create", protect, createCourse);
router.get("/", getCourses);

module.exports = router;