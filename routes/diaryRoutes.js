const express = require('express');
const router = express.Router();
const controller = require('../controllers/diaryController');
const { verifyToken } = require('../middleware/verifyToken');

router.get('/', verifyToken, controller.getAllDiary);
router.post('/', verifyToken, controller.addDiary);
router.put('/:id', verifyToken, controller.editDiary);
router.delete('/:id', verifyToken, controller.deleteDiary);

module.exports = router;
