const express = require('express');
const router = express.Router();
const planQtrController = require('../controllers/planQtrController');
const { verifyToken } = require('../middleware/verifyToken');

router.post('/add', verifyToken, planQtrController.addPlanQtr);
router.get('/', verifyToken, planQtrController.getAllPlanQtrs);
router.put('/tag/:id', verifyToken, planQtrController.updateTag);
router.put('/fav/:id', verifyToken, planQtrController.updateFavourite);
router.delete('/:id', verifyToken, planQtrController.deletePlanQtr);
router.put('/:id', verifyToken, planQtrController.updatePlanQtr);


module.exports = router;
