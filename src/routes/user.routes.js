const express = require("express");
const router = express.Router();

const { getAllUsers, deleteUser } = require("../controllers/user.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

router.get("/", protect, restrictTo("professor", "ta"), getAllUsers);
router.delete("/:id", protect, restrictTo("admin", "professor"), deleteUser);

module.exports = router;