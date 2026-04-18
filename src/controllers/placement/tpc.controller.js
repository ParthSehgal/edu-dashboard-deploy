const User = require("../../models/user.model");
const { getPlacementRole } = require("../../middleware/placement.middleware");

// ── HOD: Get all seniors in their department (for direct assignment) ─────────
exports.getSeniorsByDepartment = async (req, res) => {
  try {
    if (req.user.role !== "professor") {
      return res.status(403).json({ message: "Only faculty can view this." });
    }

    const hod = await User.findById(req.user.id).select("department name");
    console.log(`[FACULTY LOG] ${hod.name} (Dept: ${hod.department}) fetching candidates.`);

    // Get all students in same department
    const students = await User.find({
      department: hod.department,
      role: "student"
    }).select("name collegeId department isTpcCoord");
    
    console.log(`[HOD LOG] Found ${students.length} students in branch ${hod.department}`);

    // Only include seniors (3rd/4th year) — filter using placementRole
    const processedStudents = students
      .map(u => {
        try { return { ...u.toObject(), placementRole: getPlacementRole(u.collegeId) }; }
        catch { return { ...u.toObject(), placementRole: "student" }; }
      })
      .filter(u => u.placementRole === "senior");

    console.log(`[HOD LOG] Found ${processedStudents.length} eligible seniors in branch ${hod.department}`);

    res.status(200).json({ success: true, data: processedStudents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── HOD: Toggle TPC Coordinator status for a senior ──────────────────────────
exports.toggleTpcCoord = async (req, res) => {
  try {
    if (req.user.role !== "professor") {
      return res.status(403).json({ message: "Only faculty can update TPC coordinator status." });
    }

    const hod = await User.findById(req.user.id).select("department");
    const target = await User.findById(req.params.userId).select("name collegeId department isTpcCoord role");

    if (!target) return res.status(404).json({ message: "User not found." });
    if (target.department !== hod.department) {
      return res.status(403).json({ message: "You can only manage students in your department." });
    }

    // Verify they are actually a senior (3rd/4th year) or at least a student
    const placementRole = getPlacementRole(target.collegeId);
    if (placementRole === "alumni") {
      return res.status(400).json({ message: "Alumni cannot be TPC Coordinators." });
    }

    target.isTpcCoord = !target.isTpcCoord;
    await target.save();

    res.status(200).json({ 
      success: true, 
      message: `${target.name} is ${target.isTpcCoord ? "now a" : "no longer a"} TPC Coordinator.`,
      isTpcCoord: target.isTpcCoord
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
