const mongoose = require('mongoose');
const Course = require('./src/models/course.model');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const course = await Course.findOne({ courseId: 'CS2201' }).populate('students');
    console.log("Students array length:", course.students.length);
    console.log("Student Name string:", JSON.stringify(course.students[0]?.name));
    console.log("Student Type:", typeof course.students[0]?.name);
    process.exit(0);
  });
