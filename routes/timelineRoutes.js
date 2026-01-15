const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');
const { verifyToken } = require('../middleware/verifyToken');

router.post('/add', verifyToken, timelineController.addTimeline);
router.get('/', verifyToken, timelineController.getAllTimelines);
router.put('/tag/:id', verifyToken, timelineController.updateTag);
router.put('/fav/:id', verifyToken, timelineController.updateFavourite);
router.delete('/:id', verifyToken, timelineController.deleteTimeline);
router.put('/:id', verifyToken, timelineController.updateTimeline);


module.exports = router;
