const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
      unique: true // Usually one active master schedule per department
    },
    fileUrl: {
      type: String,
      required: true // Path to the uploaded document
    },
    fileType: {
      type: String,
      enum: ["excel", "pdf"],
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // The CR who uploaded it
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
