const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { verifyToken } = require('../middleware/verifyToken');

router.post('/add', verifyToken, tagController.addTag);
router.get('/', verifyToken, tagController.getTags);
router.put('/:id', verifyToken, tagController.updateTag);
router.delete('/:id', verifyToken, tagController.deleteTag);

module.exports = router;