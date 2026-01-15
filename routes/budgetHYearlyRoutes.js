const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const controller = require('../controllers/budgetHYearlyController');

router.get('/', verifyToken, controller.getAllBudgetHYearlys);
router.post('/', verifyToken, controller.addBudgetHYearly);
router.put('/:id', verifyToken, controller.editBudgetHYearly);
router.delete('/:id', verifyToken, controller.deleteBudgetHYearly);

// Nested visions
router.post('/:id/visions', verifyToken, controller.addVision);
router.put('/:id/visions/:visionId', verifyToken, controller.editVision);
router.delete('/:id/visions/:visionId', verifyToken, controller.deleteVision);

// Clear all visions
router.put('/:id/clear-visions', verifyToken, controller.clearVisions);

module.exports = router;
