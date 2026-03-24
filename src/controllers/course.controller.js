const Course = require("../models/course.model");
const { success } = require("../utils/apiResponse");
const courseService = require('../services/course.service');

// 1. Get All Courses
exports.getCourses = async (req, res, next) => {
  try {
    // Re-adding your getCourses logic based on your Day 5 notes
    const courses = await Course.find()
      .populate("instructor", "name email collegeId")
      .select("-students -tas");
    return success(res, "Courses fetched successfully", courses);
  } catch (error) {
    next(error);
  }
};

// 2. Create Course (Prof Only)
exports.createCourse = async (req, res, next) => {
  try {
    const { courseId, title, description } = req.body;

    if (!courseId || !title || !description) {
      return res.status(400).json({ message: "courseId, title and description are required" });
    }

    const course = await Course.create({
      courseId,
      title,
      description,
      instructor: req.user.id
    });

    return success(res, "Course created successfully", course);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Course with this ID already exists" });
    }
    next(error);
  }
};

// 3. Get Single Course
exports.getSingleCourse = async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const course = await courseService.getCourseById(courseId);

        res.status(200).json({
            success: true,
            data: course
        });
    } catch (error) {
        next(error);
    }
};


// 4. Student Enroll
exports.enrollInCourse = async (req, res, next) => {
  try {
    // REFACTORED: Use findOne with the custom courseId field
    const course = await Course.findOne({ courseId: req.params.id });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const alreadyEnrolled = course.students.some(
      (studentId) => studentId.toString() === req.user.id
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ message: "You are already enrolled in this course" });
    }

    course.students.push(req.user.id);
    await course.save();

    return success(res, "Enrolled successfully", course);
  } catch (error) {
    next(error);
  }
};

// 5. Update Course (Owner Only)
exports.updateCourse = async (req, res, next) => {
  try {
    const customCourseId = req.params.id;
    
    // REFACTORED: Use findOne to search by custom courseId
    let course = await Course.findOne({ courseId: customCourseId });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Authorization logic (Unchanged)
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: "Forbidden: You can only update courses that you created" 
      });
    }

    // REFACTORED: Use findOneAndUpdate instead of findByIdAndUpdate
    course = await Course.findOneAndUpdate(
      { courseId: customCourseId }, 
      req.body, 
      { new: true, runValidators: true }
    );

    return success(res, "Course updated successfully", course);
  } catch (error) {
    next(error);
  }
};

// 6. Delete Course (Owner Only)
exports.deleteCourse = async (req, res, next) => {
  try {
    const customCourseId = req.params.id;

    // REFACTORED: Use findOne to search by custom courseId
    const course = await Course.findOne({ courseId: customCourseId });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Authorization logic (Unchanged)
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden: You can only delete courses that you created"
      });
    }

    // REFACTORED: Use findOneAndDelete instead of findByIdAndDelete
    await Course.findOneAndDelete({ courseId: customCourseId });

    res.status(200).json({
      success: true,
      message: "Course deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

// 7. Get "My Courses" (Instructor Dashboard)
exports.getMyCourses = async (req, res, next) => {
  try {
    // We filter the database to only find courses created by the logged-in user
    const courses = await Course.find({ instructor: req.user.id })
      .populate("students", "name email") // Optional: Lets the professor see who is enrolled
      .sort({ createdAt: -1 }); // Sorts by newest first

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};