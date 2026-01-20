const express = require('express');
const router = express.Router();
const memoriesController = require('../controllers/prsMemoriesController');
const { verifyToken } = require('../middleware/verifyToken');

router.post('/add', verifyToken, memoriesController.addMemory);
router.get('/', verifyToken, memoriesController.getAllMemories);
router.put('/edit/:id', verifyToken, memoriesController.editMemory);
router.delete('/delete/:id', verifyToken, memoriesController.deleteMemory);
router.get('/:id', verifyToken, memoriesController.getMemoryById);

module.exports = router;
