const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const controller = require('../controllers/smmController');

router.get('/', verifyToken, controller.getAllSmms);
router.post('/', verifyToken, controller.addSmm);
router.put('/:id', verifyToken, controller.editSmm);
router.delete('/:id', verifyToken, controller.deleteSmm);

// Ideas (nested)
router.post('/:id/ideas', verifyToken, controller.addIdea);
router.put('/:id/ideas/:ideaId', verifyToken, controller.editIdea);
router.delete('/:id/ideas/:ideaId', verifyToken, controller.deleteIdea);

// Clear all ideas
router.put('/:id/clear-ideas', verifyToken, controller.clearIdeas);

module.exports = router;
