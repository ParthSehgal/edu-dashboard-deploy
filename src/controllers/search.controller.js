const { spawn } = require("child_process");
const path = require("path");
const Course = require("../models/course.model");
const { success } = require("../utils/apiResponse");

exports.searchStudents = async (req, res, next) => {
  try {
    const query = req.query.q;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query ?q= is required" });
    }

    const course = await Course.findOne({ courseId: req.params.id })
      .populate("students", "name collegeId email");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.students.length === 0) {
      return success(res, "No students enrolled in this course", []);
    }

    const studentNames = course.students.map((s) => s.name);

    // Detect OS and choose correct binary
    const isWindows = process.platform === "win32";
    const binaryName = isWindows ? "trie_search.exe" : "trie_search";
    const binaryPath = path.join(__dirname, "../trie", binaryName);

    const args = [query, ...studentNames];

    const cpp = spawn(binaryPath, args);

    let output = "";
    let errorOutput = "";

    cpp.stdout.on("data", (data) => {
      output += data.toString();
    });

    cpp.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    cpp.on("close", (code) => {
      if (code !== 0) {
        return res.status(500).json({ 
          message: "C++ Search engine failed", 
          error: errorOutput || `Process exited with code ${code}`,
          path: binaryPath
        });
      }

      const rawOutput = output.trim();
      const normalize = (str) => str.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

      const matchedNames = rawOutput ? rawOutput.split(",").map(normalize) : [];

      const matchedStudents = course.students.filter((student) =>
        matchedNames.includes(normalize(student.name))
      );

      return res.status(200).json({
        success: true,
        message: `Found ${matchedStudents.length} student(s)`,
        data: matchedStudents,
        debug: { engine: "C++ Trie", query, matchedCount: matchedStudents.length }
      });
    });

    cpp.on("error", (err) => {
      return res.status(500).json({
        message: "Failed to locate or start C++ Binary",
        error: err.message,
        hint: "Ensure the C++ engine is compiled. Run: npm install",
        platform: process.platform,
        path: binaryPath
      });
    });

  } catch (error) {
    next(error);
  }
};

const Lesson = require("../models/lesson.model");
exports.globalSearch = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query || query.trim() === "") {
      return success(res, "Empty search query", { courses: [], assignments: [] });
    }

    const regex = new RegExp(query, "i");

    const courses = await Course.find({
      $or: [{ title: regex }, { description: regex }, { courseId: regex }]
    }).populate("instructor", "name");

    const assignments = await Lesson.find({
      $or: [{ title: regex }, { description: regex }]
    }).populate("course", "courseId title");

    return success(res, "Search results fetched", { courses, assignments });
  } catch (err) {
    next(err);
  }
};
