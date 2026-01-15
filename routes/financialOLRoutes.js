const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const controller = require('../controllers/financialOLController');

router.get('/', verifyToken, controller.getAllFinancialOLs);
router.post('/', verifyToken, controller.addFinancialOL);
router.put('/:id', verifyToken, controller.editFinancialOL);
router.delete('/:id', verifyToken, controller.deleteFinancialOL);

// Nested visions
router.post('/:id/visions', verifyToken, controller.addVision);
router.put('/:id/visions/:visionId', verifyToken, controller.editVision);
router.delete('/:id/visions/:visionId', verifyToken, controller.deleteVision);

// Clear all visions
router.put('/:id/clear-visions', verifyToken, controller.clearVisions);

module.exports = router;
