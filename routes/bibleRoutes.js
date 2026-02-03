const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const controller = require('../controllers/bibleController');

router.get('/', verifyToken, controller.getAllBibles);
router.post('/', verifyToken, controller.addBible);
router.put('/:id', verifyToken, controller.editBible);
router.delete('/:id', verifyToken, controller.deleteBible);

// Nested visions
router.post('/:id/visions', verifyToken, controller.addVision);
router.put('/:id/visions/:visionId', verifyToken, controller.editVision);
router.delete('/:id/visions/:visionId', verifyToken, controller.deleteVision);

// Clear all visions
router.put('/:id/clear-visions', verifyToken, controller.clearVisions);

module.exports = router;
