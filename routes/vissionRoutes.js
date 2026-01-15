const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const controller = require('../controllers/vissionController');

router.get('/', verifyToken, controller.getAllVissions);
router.post('/', verifyToken, controller.addVission);
router.put('/:id', verifyToken, controller.editVission);
router.delete('/:id', verifyToken, controller.deleteVission);

// Nested visions
router.post('/:id/visions', verifyToken, controller.addVision);
router.put('/:id/visions/:visionId', verifyToken, controller.editVision);
router.delete('/:id/visions/:visionId', verifyToken, controller.deleteVision);

// Clear all visions
router.put('/:id/clear-visions', verifyToken, controller.clearVisions);

module.exports = router;
