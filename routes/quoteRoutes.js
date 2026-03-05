const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const controller = require('../controllers/quoteController');
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// CRUD routes
router.get('/', verifyToken, controller.getAllQuotes);
router.post('/', verifyToken, upload.single("image"), controller.addQuote);
router.put('/:id', verifyToken, upload.single("image"), controller.editQuote);
router.delete('/:id', verifyToken, controller.deleteQuote);

module.exports = router;
