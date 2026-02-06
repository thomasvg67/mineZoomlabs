const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const { verifyToken } = require('../middleware/verifyToken');

router.get('/stats', verifyToken, homeController.getHomeStats);
router.get('/unique-visitors', verifyToken, homeController.getUniqueVisitorsStats);
router.get('/activity-log', verifyToken, homeController.getActivityLog);

module.exports = router;
