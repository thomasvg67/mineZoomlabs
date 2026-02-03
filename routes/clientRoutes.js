const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { verifyToken } = require('../middleware/verifyToken');
const multer = require('multer');

const storage = multer.memoryStorage(); // keep audio in RAM
const upload = multer({ storage });

router.post('/add', verifyToken,upload.fields([
  { name: 'audioFile', maxCount: 1 },
  { name: 'imageFile', maxCount: 1 }
]), clientController.addClient);
router.get('/',verifyToken, clientController.getAllClients);
router.put('/edit/:id', verifyToken,upload.fields([
    { name: 'audioFile', maxCount: 1 },
    { name: 'imageFile', maxCount: 1 }]), clientController.editClient);
router.delete('/delete/:id', verifyToken, clientController.deleteClient);
router.get('/suggest', clientController.getSuggestions);
router.post('/bulk-delete', verifyToken, clientController.bulkDeleteClients);
router.put('/feedback/:id', verifyToken, upload.single('audioFile'), clientController.updateFeedback);


module.exports = router;
