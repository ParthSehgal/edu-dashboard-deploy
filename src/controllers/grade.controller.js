const Grade = require("../models/grade.model");
const Course = require("../models/course.model");
const { success } = require("../utils/apiResponse");

const User = require("../models/user.model");
const xlsx = require("xlsx");
const fs = require("fs");

//calculate final score
const calculateFinalScore = (components, weights, totalMarks) => {
  let totalScore = 0;
  const keys = ["quiz1", "quiz2", "midsem", "endsem", "project", "misc"];
  
  keys.forEach(key => {
    if (components[key] !== null && components[key] !== undefined) {
      const maxMarks = totalMarks && totalMarks[key] ? totalMarks[key] : 100;
      totalScore += (components[key] / maxMarks) * weights[key];
    }
  });
  
  return parseFloat(totalScore.toFixed(2)); // Round to 2 decimal places
};

// 1. Get entire class gradebook (Professors & TAs)
exports.getCourseGrades = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    
    const course = await Course.findOne({ courseId });
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Security: Only the instructor (or future TAs) can view the whole gradebook
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: You do not have permission to view these grades." });
    }

    // Fetch grades and populate the student's name and collegeId
    const grades = await Grade.find({ course: course._id })
      .populate("student", "name collegeId email")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: grades.length,
      data: grades
    });
  } catch (error) {
    next(error);
  }
};

// 2. Update Component Grades (Professors & TAs)
exports.updateComponents = async (req, res, next) => {
  try {
    const { courseId, studentId } = req.params;
    const updates = req.body;

    const course = await Course.findOne({ courseId });
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructor.toString() !== req.user.id && req.user.role !== "ta") {
      return res.status(403).json({ message: "Forbidden: Only Instructors and TAs can edit components." });
    }

    const gradeSheet = await Grade.findOne({ course: course._id, student: studentId });
    if (!gradeSheet) return res.status(404).json({ message: "Grade sheet not found." });

    const updateMessages = [];
    Object.keys(updates).forEach((key) => {
      if (gradeSheet.components[key] !== undefined) {
        gradeSheet.components[key] = updates[key];
        updateMessages.push(`Updated ${key} to ${updates[key]}`);
      }
    });

    gradeSheet.finalScore = calculateFinalScore(gradeSheet.components, course.weights, course.totalMarks);

    if (updateMessages.length > 0) {
      gradeSheet.auditLog.push({
        updatedBy: req.user.id,
        role: req.user.role,
        action: updateMessages.join(", ") + ` | Auto-calculated new Final Score: ${gradeSheet.finalScore}`
      });
    }

    await gradeSheet.save();
    return success(res, "Grades updated and final score recalculated", gradeSheet);
  } catch (error) {
    next(error);
  }
};
// 3. Publish Grades (Professor Only)
exports.publishGrades = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findOne({ courseId });

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: Only the instructor can publish." });
    }

    const allGrades = await Grade.find({ course: course._id });
    const missingGrades = allGrades.filter(g => g.finalGrade === null);

    if (missingGrades.length > 0) {
      return res.status(400).json({ 
        message: `Cannot publish. ${missingGrades.length} students are missing their official Final Grade.` 
      });
    }

    course.gradesPublished = true;
    await course.save();

    return success(res, "Grades successfully published to all students.");
  } catch (error) {
    next(error);
  }
};

// 4. View My Grades (Student Only)
exports.getMyGrades = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;

    const course = await Course.findOne({ courseId });
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Security Check 1: Are grades published yet?
    if (!course.gradesPublished) {
      return res.status(403).json({ 
        message: "Grades for this course have not been released by the instructor yet." 
      });
    }

    // Security Check 2: Fetch ONLY the logged-in student's grade sheet
    const myGrade = await Grade.findOne({ 
      course: course._id, 
      student: req.user.id 
    }).select("-auditLog"); // We hide the audit log from the student for security

    if (!myGrade) {
      return res.status(404).json({ message: "Grade sheet not found." });
    }

    return res.status(200).json({
      success: true,
      data: myGrade
    });
  } catch (error) {
    next(error);
  }
};

// NEW: Assign Official Letter Grade (Professor ONLY)
exports.updateFinalGrade = async (req, res, next) => {
  try {
    const { courseId, studentId } = req.params;
    const { finalGrade } = req.body;

    const course = await Course.findOne({ courseId });
    
    // SECURITY: strictly professor
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: Only the Professor can assign final grades." });
    }

    const gradeSheet = await Grade.findOne({ course: course._id, student: studentId });
    gradeSheet.finalGrade = finalGrade;
    
    gradeSheet.auditLog.push({
      updatedBy: req.user.id,
      role: "professor",
      action: `Assigned official Final Grade: ${finalGrade}`
    });

    await gradeSheet.save();
    return success(res, "Final grade assigned successfully", gradeSheet);
  } catch (error) {
    next(error);
  }
};
const { Parser } = require("json2csv");
const csv = require("csvtojson");

// Export Grades to CSV
exports.exportGradesCSV = async (req, res, next) => {
  try {
    const course = await Course.findOne({ courseId: req.params.courseId });
    if (course.instructor.toString() !== req.user.id) return res.status(403).json({ message: "Forbidden" });

    const grades = await Grade.find({ course: course._id }).populate("student", "name collegeId");
    
    // Flatten data for Excel
    const csvData = grades.map(g => ({
      StudentID: g.student._id.toString(), // CRITICAL for re-importing
      RollNumber: g.student.collegeId,
      Name: g.student.name,
      Quiz1: g.components.quiz1 || 0,
      Quiz2: g.components.quiz2 || 0,
      Midsem: g.components.midsem || 0,
      Endsem: g.components.endsem || 0,
      Project: g.components.project || 0,
      Misc: g.components.misc || 0,
      CalculatedScore: g.finalScore || 0,
      OfficialFinalGrade: g.finalGrade || ""
    }));

    const json2csvParser = new Parser();
    const csvString = json2csvParser.parse(csvData);

    res.header("Content-Type", "text/csv");
    res.attachment(`${req.params.courseId}_Grades.csv`);
    return res.send(csvString);
  } catch (error) {
    next(error);
  }
};

// Import Grades from CSV or Excel
exports.importGradesCSV = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Please upload a valid file" });
    
    // Check limit (2MB)
    if (req.file.size > 2 * 1024 * 1024) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "File exceeds 2MB limit" });
    }
    
    const course = await Course.findOne({ courseId: req.params.courseId });
    if (course.instructor.toString() !== req.user.id) {
       fs.unlinkSync(req.file.path);
       return res.status(403).json({ message: "Forbidden" });
    }

    // Parse CSV or Excel to JSON string -> Object
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const rawGradeData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Normalize headers (trim spaces, lower case for standard mapping)
    const gradeData = rawGradeData.map(row => {
      const normalizedRow = {};
      for (const key in row) {
        // e.g., "Misc " -> "misc", "Quiz 1" -> "quiz1"
        const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '');
        normalizedRow[cleanKey] = row[key];
      }
      return normalizedRow;
    });

    // Loop through rows and update database
    let importCount = 0;
    
    for (let row of gradeData) {
      let gradeSheet = null;
      
      const studentIdMatch = row.studentid || row.id;
      if (studentIdMatch) {
        gradeSheet = await Grade.findOne({ course: course._id, student: studentIdMatch });
      }
      
      // Fallback to RollNumber or Student
      const rollMatch = row.rollnumber || row.student || row.roll || row.collegeid;
      if (!gradeSheet && rollMatch) {
         const user = await User.findOne({ collegeId: String(rollMatch).trim() });
         if (user) {
            gradeSheet = await Grade.findOne({ course: course._id, student: user._id });
         }
      }
      
      if (gradeSheet) {
        gradeSheet.components = {
          quiz1: Number(row.quiz1) || 0, 
          quiz2: Number(row.quiz2) || 0,
          midsem: Number(row.midsem) || 0, 
          endsem: Number(row.endsem) || 0,
          project: Number(row.project) || 0, 
          misc: Number(row.misc) || 0
        };
        gradeSheet.finalGrade = row.officialfinalgrade || row.finalgrade || null;
        gradeSheet.finalScore = calculateFinalScore(gradeSheet.components, course.weights, course.totalMarks);
        
        gradeSheet.auditLog.push({
          updatedBy: req.user.id,
          role: "professor",
          action: "Bulk updated via Excel/CSV Import"
        });
        await gradeSheet.save();
        importCount++;
      }
    }
    
    fs.unlinkSync(req.file.path); // Clean up file
    return success(res, `${importCount} grades successfully imported and recalculated`);
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};