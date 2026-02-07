const express = require('express');
const router = express.Router();
const pandlController = require('../controllers/pandlController');
const { verifyToken } = require('../middleware/verifyToken');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/add', verifyToken, upload.fields([
  { name: 'audioFile', maxCount: 1 },
  { name: 'imageFile', maxCount: 1 }
]), pandlController.addPandL);

router.get('/', verifyToken, pandlController.getAllPandL);
router.put('/edit/:id', verifyToken, upload.fields([
  { name: 'audioFile', maxCount: 1 },
  { name: 'imageFile', maxCount: 1 }
]), pandlController.editPandL);

router.delete('/delete/:id', verifyToken, pandlController.deletePandL);
router.get('/suggest', verifyToken, pandlController.getClientSuggestions);
router.post('/bulk-delete', verifyToken, pandlController.bulkDeletePandL);
router.get('/clients/search', verifyToken, pandlController.searchClientsByName);

module.exports = router;