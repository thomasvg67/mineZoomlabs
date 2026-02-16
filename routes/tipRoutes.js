const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const controller = require('../controllers/tipController');

// CRUD Routes
router.get('/', verifyToken, controller.getAllTips);
router.post('/', verifyToken, controller.addTip);
router.put('/:id', verifyToken, controller.editTip);
router.delete('/:id', verifyToken, controller.deleteTip);

module.exports = router;
