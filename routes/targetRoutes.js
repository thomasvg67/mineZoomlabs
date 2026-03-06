const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const targetController = require('../controllers/targetController');


// Get all targetlist today
router.get('/', verifyToken, targetController.getTargetList);

// Get all targetlist pending
router.get('/pending', verifyToken, targetController.getPendingTargetList);

// Get all trash targetlist
router.get('/trash', verifyToken, targetController.getTrashTargetList);

// Get all taskdone targetlist
router.get('/taskdone', verifyToken, targetController.getDoneTargetList);

// Get all important targetlist
router.get('/important', verifyToken, targetController.getImportantTargetList);

// Add a new targetlist
router.post('/', verifyToken, targetController.addTodolist);

// Get targetlist by ID
router.get('/:id', verifyToken, targetController.getTodolistById);

// Update a targetlist by ID
router.put('/:id', verifyToken, targetController.updateTodolist);


// Delete a targetlist by ID
router.delete('/:id', verifyToken, targetController.deleteTodolist);

//Mark a Todo as Important
router.put('/markimportant/:id', verifyToken, targetController.updateImportanttargetlist);

//Mark Todo as Task done
router.put('/taskdone/:id', verifyToken, targetController.updateTaskdonetargetlist);

//Mark Todo as Not Task done 
router.put('/taskdoneremove/:id', verifyToken, targetController.updateTaskdoneRemovetargetlist);

// Revive a targetlist by ID
router.put('/revive/:id', verifyToken, targetController.reviveTodolist);

// Permanent Delete a targetlist by ID
router.delete('/permanentdelete/:id', verifyToken, targetController.permanentdeleteTodolist);

// Create priority for a targetlist by ID
router.put('/priority/:id', verifyToken, targetController.priorityTodolist);

module.exports = router;