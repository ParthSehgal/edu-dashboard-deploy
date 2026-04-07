const { success } = require("../utils/apiResponse");
const { getPlacementRole } = require("../middleware/placement.middleware");

// GET /api/placement/test — public
exports.test = (req, res) => {
  return success(res, "Placement module is working!", {
    module: "EduNexus Placement",
    features: [
      "SDE Sheet",
      "Mock OA",
      "Leaderboard",
      "Interview Experience",
      "Blogs",
      "Industry Talks"
    ]
  });
};

// GET /api/placement/me — returns placement role of logged in user
exports.getMyPlacementRole = (req, res) => {
  const placementRole = getPlacementRole(req.user.collegeId || "");
  return success(res, "Placement role fetched", { placementRole });
};
