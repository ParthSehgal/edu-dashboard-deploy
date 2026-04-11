const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth.middleware');
const scheduleController = require('../controllers/schedule.controller');

// Configure multer for memory storage since we just need to parse it
const upload = multer({ storage: multer.memoryStorage() });

// Add schedule upload route
router.post('/upload', protect, upload.single('file'), scheduleController.uploadSchedule);
router.get('/', protect, scheduleController.getSchedule);

module.exports = router;
