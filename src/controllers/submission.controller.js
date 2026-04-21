const Submission = require("../models/submission.model");
const Course = require("../models/course.model");
const { success } = require("../utils/apiResponse");
const { cloudinary } = require("../config/cloudinary");

// Helper to extract Cloudinary public_id from a secure_url
function extractPublicId(url) {
  try {
    // e.g. https://res.cloudinary.com/<cloud>/raw/upload/v123/edunexus_uploads/myfile.zip
    // We need everything from the folder onwards, without the file extension
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    // Remove versioning (v123/)
    const withoutVersion = parts[1].replace(/^v\d+\//, '');
    // Remove file extension
    const publicId = withoutVersion.replace(/\.[^/.]+$/, '');
    return publicId;
  } catch {
    return null;
  }
}

exports.submitAssignment = async (req, res, next) => {
  try {
    const customCourseId = req.params.courseId;
    const { assignmentTitle } = req.body;

    // 1. Find the course
    const course = await Course.findOne({ courseId: customCourseId });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 2. Security Check: Is this student enrolled?
    const isEnrolled = course.students.some(
      (studentId) => studentId.toString() === req.user.id
    );

    if (!isEnrolled) {
      return res.status(403).json({ 
        message: "Forbidden: You cannot submit assignments for a course you are not enrolled in." 
      });
    }

    // 3. Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Please upload your assignment file" });
    }

    // 4. The file is already uploaded to Cloudinary by multer-storage-cloudinary.
    //    req.file.path holds the secure_url.
    const newFileUrl = req.file.path;

    // 5. Check if a submission already exists for this exact assignment by this student
    let existingSubmission = await Submission.findOne({
      student: req.user.id,
      course: course._id,
      assignmentTitle: assignmentTitle
    });

    if (existingSubmission) {
      // --- UPDATE EXISTING SUBMISSION ---
      // A. Delete the OLD file from Cloudinary
      const oldPublicId = extractPublicId(existingSubmission.fileUrl);
      if (oldPublicId) {
        try {
          // Try raw first (for zip/docx/pdf), fallback to auto
          await cloudinary.uploader.destroy(oldPublicId, { resource_type: 'raw' });
        } catch (e) {
          console.warn("Could not delete old Cloudinary file:", e.message);
        }
      }

      // B. Update the database record with the new Cloudinary URL
      existingSubmission.fileUrl = newFileUrl;
      await existingSubmission.save();

      return success(res, "Submission updated successfully", existingSubmission);
      
    } else {
      // --- CREATE NEW SUBMISSION ---
      const newSubmission = await Submission.create({
        assignmentTitle: assignmentTitle,
        fileUrl: newFileUrl,        // Cloudinary secure_url
        student: req.user.id,
        course: course._id
      });

      return success(res, "Assignment submitted successfully", newSubmission);
    }
  } catch (error) {
    next(error);
  }
};

// Get all submissions for a specific course (Professor / TA Only)
exports.getSubmissionsForCourse = async (req, res, next) => {
  try {
    const customCourseId = req.params.courseId;

    // 1. Find the course to verify ownership
    const course = await Course.findOne({ courseId: customCourseId });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 2. Security Check: Is this professor or TA the owner/assigned to the course?
    if (req.user.role === 'professor' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: You can only view submissions for your own courses." });
    }
    if (req.user.role === 'ta' && !course.tas.includes(req.user.id)) {
      return res.status(403).json({ message: "Forbidden: You are not a TA for this course." });
    }

    // 3. Fetch the submissions and populate the student details
    const submissions = await Submission.find({ course: course._id })
      .populate("student", "name email collegeId")
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};
