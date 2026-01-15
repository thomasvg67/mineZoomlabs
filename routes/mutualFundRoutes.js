const express = require('express');
const router = express.Router();
const mutualFundController = require('../controllers/mutualFundController');
const { verifyToken } = require('../middleware/verifyToken');

router.post('/add', verifyToken, mutualFundController.addMutualFund);
router.get('/', verifyToken, mutualFundController.getAllMutualFunds);
router.put('/edit/:id', verifyToken, mutualFundController.editMutualFund);
router.delete('/delete/:id', verifyToken, mutualFundController.deleteMutualFund);
router.get('/:id', verifyToken, mutualFundController.getMutualFundById);

module.exports = router;
