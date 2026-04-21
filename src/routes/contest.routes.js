// src/routes/contest.routes.js
const express = require('express');
const router = express.Router();
const { getUpcomingContests } = require('../controllers/contest.controller');

router.get('/upcoming', getUpcomingContests);

module.exports = router;