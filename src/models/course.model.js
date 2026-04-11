const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true,
      enum: [
        "CSE",
        "Mech",
        "Electrical",
        "Data Science",
        "Mathematics and Computing",
        "AI",
        "Civil",
        "Humanities",
        "Unknown"
      ]
    },
    gradesPublished: {
      type: Boolean,
      default: false
    },
    weights: {
      quiz1: { type: Number, default: 10 },
      quiz2: { type: Number, default: 10 },
      midsem: { type: Number, default: 30 },
      endsem: { type: Number, default: 40 },
      project: { type: Number, default: 5 },
      misc: { type: Number, default: 5 }
    },
    totalMarks: {
      quiz1: { type: Number, default: 100 },
      quiz2: { type: Number, default: 100 },
      midsem: { type: Number, default: 100 },
      endsem: { type: Number, default: 100 },
      project: { type: Number, default: 100 },
      misc: { type: Number, default: 100 }
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    tas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
