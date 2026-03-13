const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { verifyToken } = require('../middleware/verifyToken');
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });


router.post('/add', verifyToken, upload.single("image"), noteController.addNote);
router.get('/', verifyToken, noteController.getAllNotes);
router.get('/general', verifyToken, noteController.getGeneralNotes);
router.put('/tag/:id', verifyToken, noteController.updateTag);
router.put('/fav/:id', verifyToken, noteController.updateFavourite);
router.delete('/:id', verifyToken, noteController.deleteNote);
router.put('/:id', verifyToken, upload.single("image"), noteController.updateNote);


module.exports = router;
