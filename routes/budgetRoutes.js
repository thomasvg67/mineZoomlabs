const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const controller = require('../controllers/budgetController');

router.get('/', verifyToken, controller.getAllBudgets);
router.post('/', verifyToken, controller.addBudget);
router.put('/:id', verifyToken, controller.editBudget);
router.delete('/:id', verifyToken, controller.deleteBudget);

// Nested visions
router.post('/:id/visions', verifyToken, controller.addVision);
router.put('/:id/visions/:visionId', verifyToken, controller.editVision);
router.delete('/:id/visions/:visionId', verifyToken, controller.deleteVision);

// Clear all visions
router.put('/:id/clear-visions', verifyToken, controller.clearVisions);

module.exports = router;
