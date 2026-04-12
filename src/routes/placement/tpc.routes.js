const express = require("express");
const router = express.Router();
const {
  getSeniorsByDepartment,
  toggleTpcCoord
} = require("../../controllers/placement/tpc.controller");
const { protect } = require("../../middleware/auth.middleware");
const { attachPlacementRole } = require("../../middleware/placement.middleware");

router.use(protect);
router.use(attachPlacementRole); // attaches req.isHOD

// HOD management routes
router.get("/seniors", getSeniorsByDepartment);       // list all seniors in faculty's department
router.put("/toggle/:userId", toggleTpcCoord);         // toggle isTpcCoord status

module.exports = router;
