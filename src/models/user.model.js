const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    collegeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ["student", "ta", "professor", "alumni"],
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

    // ── OTP VERIFICATION ───────────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false       // user cannot login until OTP is verified
    },
    otp: {
      type: String,        // stored as hashed string
      default: null
    },
    otpExpiry: {
      type: Date,          // OTP expires after 5 minutes
      default: null
    },
<<<<<<< HEAD

    // Used to denote if a Student is a Class Representative 
    // This allows them to upload branch schedules
    isCR: {
      type: Boolean,
      default: false
    },
    
    // ── PROFILE PREFERENCES & ACADEMICS ────────────────────────
    emailNotifications: {
      type: Boolean,
      default: true
    },
    cgpa: {
      type: Number,
      default: 0
    },
    totalCreditsEarned: {
      type: Number,
      default: 0
    },
    bio: {
      type: String,
      default: ""
    },
    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      portfolio: { type: String, default: "" }
    },
    targetRoles: [
      {
        type: String,
        trim: true
      }],

=======
    // ── ROADMAP PROGRESS ───────────────────────────────────────
>>>>>>> c6f7103426369fb7cc70487ef953e4a9376ef230
    completedRoadmapQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RoadmapQuestion"
      }
    ]
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
