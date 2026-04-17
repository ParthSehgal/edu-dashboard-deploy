// Dummy in-memory storage

let courses = [];

exports.createCourse = async ({ title, description }) => {
  const course = {
    id: courses.length + 1,
    title,
    description
  };

  courses.push(course);

  return course;
};



const Course = require('../models/course.model');

exports.getCourseById = async (courseIdParam) => {
    const course = await Course.findOne({ courseId: courseIdParam })
        .populate('instructor', 'name email collegeId') 
        .populate('students', 'name email collegeId isCR'); 

    if (!course) {
        const error = new Error('Course not found');
        error.statusCode = 404;
        throw error;
    }

    return course;
};