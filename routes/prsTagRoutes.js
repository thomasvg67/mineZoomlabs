const express = require('express');
const router = express.Router();
const tagController = require('../controllers/prsTagController');
const { verifyToken } = require('../middleware/verifyToken');

router.post('/add', verifyToken, tagController.addTag);
router.get('/', verifyToken, tagController.getTags);
router.put('/:id', verifyToken, tagController.updateTag);

module.exports = router;
