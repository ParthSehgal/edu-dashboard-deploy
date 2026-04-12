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


    // Used to denote if a Student is a Class Representative 
    // This allows them to upload branch schedules
    isCR: {
      type: Boolean,
      default: false
    },

    // ── TPC COORDINATOR ────────────────────────────────────────
    // Set to true by HOD. Only TPC Coords can post contests & tech updates.
    isTpcCoord: {
      type: Boolean,
      default: false
    },

    // ── HOD FLAG (Professor only) ───────────────────────────────
    isHOD: {
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

    // ── PROFESSOR FACULTY PROFILE FIELDS ─────────────────────
    academicTitle: {
      type: String,
      default: "Professor"
    },
    researchInterests: [
      { type: String, trim: true }
    ],
    officeLocation: {
      type: String,
      default: ""
    },
    officeHours: [
      {
        day: { type: String },       // e.g. "Monday"
        from: { type: String },      // e.g. "10:00 AM"
        to: { type: String }         // e.g. "12:00 PM"
      }
    ],
    scholarLink: {
      type: String,
      default: ""
    },
    personalWebsite: {
      type: String,
      default: ""
    },
    notifications: {
      taGradeSubmit:           { type: Boolean, default: true },
      weeklyPerformanceSummary:{ type: Boolean, default: true }
    },

    targetRoles: [
      {
        type: String,
        trim: true
      }],

    // ── ROADMAP PROGRESS ───────────────────────────────────────
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
