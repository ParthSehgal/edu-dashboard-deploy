const courseService = require("../services/course.service");
const { success } = require("../utils/apiResponse");

const Course = require("../models/course.model");

exports.createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;

    const course = await Course.create({
      title,
      description,
      instructor: req.user.id  
    });

    res.json({
      message: "Course created",
      course
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCourses = async (req, res, next) => {
  try {
    const data = await courseService.getCourses();
    return success(res, "Courses fetched", data);
  } catch (err) {
    next(err);
  }
};