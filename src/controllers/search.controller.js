const { spawn } = require("child_process");
const path = require("path");
const Course = require("../models/course.model");
const { success } = require("../utils/apiResponse");

// GET /api/courses/:id/students/search?q=tan
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


    const binaryPath = path.join(__dirname, "../../trie/trie_search");

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
        console.error("C++ process error:", errorOutput);
        return res.status(500).json({ message: "Search engine error" });
      }

      const matchedNames = output.trim()
        ? output.trim().split(",")
        : [];

      const matchedStudents = course.students.filter((student) =>
        matchedNames.includes(student.name)
      );

      return success(res, `Found ${matchedStudents.length} student(s)`, matchedStudents);
    });

    cpp.on("error", (err) => {
      console.error("Failed to start C++ process:", err.message);
      return res.status(500).json({
        message: "Could not start search engine. Is the binary compiled?",
        hint: "Run: g++ -o trie/trie_search trie/trie_search.cpp"
      });
    });

  } catch (error) {
    next(error);
  }
};
