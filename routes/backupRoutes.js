const express = require('express');
const router = express.Router();
const { downloadBackup } = require('../controllers/backupController');
const { verifyToken } = require('../middleware/verifyToken');

router.get('/', verifyToken, downloadBackup);

module.exports = router;
