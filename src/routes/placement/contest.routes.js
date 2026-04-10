const express = require("express");
const router = express.Router();
const { getContests, addContest, getContestById, addContestDiscussion, deleteContest } = require("../../controllers/placement/contest.controller");
const { protect } = require("../../middleware/auth.middleware");
const { attachPlacementRole } = require("../../middleware/placement.middleware");

// Apply middleware
router.use(protect);
router.use(attachPlacementRole);

// Routes
router.get("/", getContests);
router.post("/", addContest);

router.get("/:id", getContestById);
router.post("/:id/discussion", addContestDiscussion);
router.delete("/:id", deleteContest);

module.exports = router;
