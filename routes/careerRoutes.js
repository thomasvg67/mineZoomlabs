const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const { verifyToken } = require('../middleware/verifyToken');
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();
const handleFileUpload = multer({ storage }).fields([
  { name: 'imageFile', maxCount: 1 },
  { name: 'audioFile', maxCount: 1 },
  { name: 'documents', maxCount: 10 },
]);

// Routes
router.post('/add', verifyToken, handleFileUpload, careerController.addCareer);
router.get('/', verifyToken, careerController.getAllCareers);
router.put('/edit/:id', verifyToken, handleFileUpload, careerController.editCareer);
router.delete('/delete/:id', verifyToken, careerController.deleteCareer);
router.get('/:id', verifyToken, careerController.getCareerById);

module.exports = router;