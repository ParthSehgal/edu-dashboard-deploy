const User = require("../models/user.model");
const Grade = require("../models/grade.model");
const bcrypt = require("bcryptjs");
const { success } = require("../utils/apiResponse");

// prof ans TA can access the feature only 
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    return success(res, "Users fetched", users);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return success(res, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};

// ── GET LOGGED IN USER PROFILE ─────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpiry");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return success(res, "Profile fetched successfully", user);
  } catch (error) {
    next(error);
  }
};

// ── UPDATE LOGGED IN USER PROFILE ───────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      bio, socialLinks, targetRoles, emailNotifications,
      // Faculty fields
      academicTitle, researchInterests, officeLocation, officeHours,
      scholarLink, personalWebsite, notifications
    } = req.body;
    
    // Build update object (only include defined fields)
    const updateFields = {};
    if (bio !== undefined) updateFields.bio = bio;
    if (socialLinks !== undefined) updateFields.socialLinks = socialLinks;
    if (targetRoles !== undefined) updateFields.targetRoles = targetRoles;
    if (emailNotifications !== undefined) updateFields.emailNotifications = emailNotifications;
    // Professor fields
    if (academicTitle !== undefined) updateFields.academicTitle = academicTitle;
    if (researchInterests !== undefined) updateFields.researchInterests = researchInterests;
    if (officeLocation !== undefined) updateFields.officeLocation = officeLocation;
    if (officeHours !== undefined) updateFields.officeHours = officeHours;
    if (scholarLink !== undefined) updateFields.scholarLink = scholarLink;
    if (personalWebsite !== undefined) updateFields.personalWebsite = personalWebsite;
    if (notifications !== undefined) updateFields.notifications = notifications;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select("-password -otp -otpExpiry");

    return success(res, "Profile updated successfully", user);
  } catch (error) {
    next(error);
  }
};

// ── GET COURSE TEACHING ARCHIVE (Professor only) ───────────────
exports.getCourseArchive = async (req, res, next) => {
  try {
    const Course = require("../models/course.model");
    const courses = await Course.find({ instructor: req.user.id })
      .select("courseId title students createdAt")
      .sort({ createdAt: -1 });

    const archive = courses.map(c => ({
      courseId: c.courseId,
      title: c.title,
      totalStudents: c.students?.length || 0,
      semester: new Date(c.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    }));

    return success(res, "Course archive fetched", archive);
  } catch (error) {
    next(error);
  }
};

// ── UPDATE LOGGED IN USER PASSWORD ─────────────────────────────
exports.updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide old and new password" });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect old password" });
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return success(res, "Password updated successfully");
  } catch (error) {
    next(error);
  }
};

// ── GET ACADEMIC TRANSCRIPT ────────────────────────────────────
exports.getTranscript = async (req, res, next) => {
  try {
    const transcript = await Grade.find({ 
      student: req.user.id,
      finalGrade: { $ne: null } 
    }).populate({
      path: "course",
      select: "title courseId credits"
    });

    return success(res, "Transcript fetched successfully", transcript);
  } catch (error) {
    next(error);
  }
};
