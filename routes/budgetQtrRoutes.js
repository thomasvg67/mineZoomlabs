const express = require('express');
const router = express.Router();
const budgetQtrController = require('../controllers/budgetQtrController');
const { verifyToken } = require('../middleware/verifyToken');

router.post('/add', verifyToken, budgetQtrController.addBudgetQtr);
router.get('/', verifyToken, budgetQtrController.getAllBudgetQtrs);
router.put('/tag/:id', verifyToken, budgetQtrController.updateTag);
router.put('/fav/:id', verifyToken, budgetQtrController.updateFavourite);
router.delete('/:id', verifyToken, budgetQtrController.deleteBudgetQtr);
router.put('/:id', verifyToken, budgetQtrController.updateBudgetQtr);


module.exports = router;
