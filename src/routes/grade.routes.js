const express = require("express");
const router = express.Router({ mergeParams: true }); 
const { exportGradesCSV, importGradesCSV, updateFinalGrade } = require("../controllers/grade.controller");
// Removed general upload to use a targeted one for grades
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const gradeFileFilter = (req, file, cb) => {
  const allowedExtensions = /csv|xlsx|xls/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only Excel (.xlsx, .xls) and CSV (.csv) are allowed for importing grades."));
  }
};

const uploadGrades = multer({ 
  storage: storage,
  fileFilter: gradeFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB restriction applied directly in middleware
});


const { 
  getCourseGrades, 
  updateComponents, 
  publishGrades, 
  getMyGrades 
} = require("../controllers/grade.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

// CSV Export & Import
router.get("/export", protect, restrictTo("professor"), exportGradesCSV);

router.post("/import", protect, restrictTo("professor"), uploadGrades.single("file"), importGradesCSV);

// 1. Student views their own grades
router.get("/my-grades", protect, restrictTo("student"), getMyGrades);

// 2. Professor publishes the grades
router.patch("/publish", protect, restrictTo("professor"), publishGrades);

// 3. Professor views the whole class gradebook
router.get("/", protect, restrictTo("professor"), getCourseGrades);

// 4. Professor and TA updates a specific student's grade components
router.put("/:studentId/components", protect, restrictTo("professor", "ta"), updateComponents);

//Only Professor can give final grade
router.put("/:studentId/final", protect, restrictTo("professor"), updateFinalGrade);

module.exports = router;