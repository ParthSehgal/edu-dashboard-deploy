const mongoose = require("mongoose");

const mockOASchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    syllabus: {
      type: String
    },
    date: {
      type: Date
    },
    selectedStudents: [
      {
        name: { type: String, required: true },
        rollNo: { type: String, required: true }
      }
    ],
    resultsUploaded: {
      type: Boolean,
      default: false
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MockOA", mockOASchema);
