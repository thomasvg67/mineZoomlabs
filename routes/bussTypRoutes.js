const express = require('express');
const router = express.Router();
const bussTypController = require('../controllers/bussTypController');
const { verifyToken } = require('../middleware/verifyToken');

router.get('/', verifyToken, bussTypController.getAllBussTypes);
router.post('/add', verifyToken, bussTypController.addBussType);

module.exports = router;