const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken } = require('../middleware/verifyToken');

router.get('/:contactId', verifyToken, messageController.getMessagesByContactId);

module.exports = router;
