const express = require('express');
const router = express.Router();
const noteHsController = require('../controllers/noteHsController');
const { verifyToken } = require('../middleware/verifyToken');
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });


router.post('/add', verifyToken, upload.single("image"), noteHsController.addNote);
router.get('/', verifyToken, noteHsController.getAllNotes);
router.put('/tag/:id', verifyToken, noteHsController.updateTag);
router.put('/fav/:id', verifyToken, noteHsController.updateFavourite);
router.delete('/:id', verifyToken, noteHsController.deleteNote);
router.put('/:id', verifyToken, upload.single("image"), noteHsController.updateNote);


module.exports = router;
