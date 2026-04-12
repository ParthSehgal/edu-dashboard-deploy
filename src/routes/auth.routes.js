const express = require("express");
const router = express.Router();

const { register, verifyOTP, login, promoteToHOD } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/register",    register);
router.post("/verify-otp",  verifyOTP);
router.post("/login",       login);
router.post("/promote-to-hod", protect, promoteToHOD);

module.exports = router;
