const express = require("express");
const router = express.Router();
const { getOAs, addOA, uploadResults, deleteOA } = require("../../controllers/placement/mockOA.controller");
const { protect } = require("../../middleware/auth.middleware");
const { attachPlacementRole } = require("../../middleware/placement.middleware");

// Apply middleware
router.use(protect);
router.use(attachPlacementRole);

// Routes
router.get("/", getOAs);
router.post("/", addOA);
router.put("/:id/results", uploadResults);
router.delete("/:id", deleteOA);

module.exports = router;
