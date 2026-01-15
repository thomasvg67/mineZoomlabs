const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');
const { verifyToken } = require('../middleware/verifyToken');

router.post('/add', verifyToken, shareController.addShare);
router.get('/', verifyToken, shareController.getAllShares);
router.put('/edit/:id', verifyToken, shareController.editShare);
router.delete('/delete/:id', verifyToken, shareController.deleteShare);
router.get('/:id', verifyToken, shareController.getShareById);

module.exports = router;
