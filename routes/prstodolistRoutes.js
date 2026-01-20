const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const prstodolistController = require('../controllers/prstodolistController');


// Get all prstodolist today
router.get('/', verifyToken, prstodolistController.getTodosList);

// Get all prstodolist pending
router.get('/pending', verifyToken, prstodolistController.getPendingTodosList);

// Get all trash prstodolist
router.get('/trash', verifyToken, prstodolistController.getTrashTodosList);

// Get all taskdone prstodolist
router.get('/taskdone', verifyToken, prstodolistController.getDoneTodosList);

// Get all important prstodolist
router.get('/important', verifyToken, prstodolistController.getImportantTodosList);

// Add a new prstodolist
router.post('/', verifyToken, prstodolistController.addPrstodolist);

// Get prstodolist by ID
router.get('/:id', verifyToken, prstodolistController.getPrstodolistById);

// Update a prstodolist by ID
router.put('/:id', verifyToken, prstodolistController.updatePrstodolist);


// Delete a prstodolist by ID
router.delete('/:id', verifyToken, prstodolistController.deletePrstodolist);

//Mark a Todo as Important
router.put('/markimportant/:id', verifyToken, prstodolistController.updateImportantprstodolist);

//Mark Todo as Task done
router.put('/taskdone/:id', verifyToken, prstodolistController.updateTaskdoneprstodolist);

//Mark Todo as Not Task done 
router.put('/taskdoneremove/:id', verifyToken, prstodolistController.updateTaskdoneRemoveprstodolist);

// Revive a prstodolist by ID
router.put('/revive/:id', verifyToken, prstodolistController.revivePrstodolist);

// Permanent Delete a prstodolist by ID
router.delete('/permanentdelete/:id', verifyToken, prstodolistController.permanentdeletePrstodolist);

// Create priority for a prstodolist by ID
router.put('/priority/:id', verifyToken, prstodolistController.priorityPrstodolist);

module.exports = router;