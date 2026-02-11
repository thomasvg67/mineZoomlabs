const express = require('express');
const router = express.Router();
const programmingController = require('../controllers/programmingController');
const { verifyToken } = require('../middleware/verifyToken');

router.post('/add', verifyToken, programmingController.addProgramming);
router.get('/', verifyToken, programmingController.getAllProgramming);
router.put('/edit/:id', verifyToken, programmingController.editProgramming);
router.delete('/delete/:id', verifyToken, programmingController.deleteProgramming);
router.get('/:id', verifyToken, programmingController.getProgrammingById);

module.exports = router;
