const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const planController = require('../controllers/planController');


// Get all plan today
router.get('/', verifyToken, planController.getPlanList);

// Get all plan pending
router.get('/pending', verifyToken, planController.getPendingPlanList);

// Get all trash plan
router.get('/trash', verifyToken, planController.getTrashPlanList);

// Get all taskdone plan
router.get('/taskdone', verifyToken, planController.getDonePlanList);

// Get all important plan
router.get('/important', verifyToken, planController.getImportantPlanList);

// Add a new plan
router.post('/', verifyToken, planController.addPlan);

// Get plan by ID
router.get('/:id', verifyToken, planController.getPlanById);

// Update a plan by ID
router.put('/:id', verifyToken, planController.updatePlan);


// Delete a plan by ID
router.delete('/:id', verifyToken, planController.deletePlan);

//Mark a Todo as Important
router.put('/markimportant/:id', verifyToken, planController.updateImportantplan);

//Mark Todo as Task done
router.put('/taskdone/:id', verifyToken, planController.updateTaskdoneplan);

//Mark Todo as Not Task done 
router.put('/taskdoneremove/:id', verifyToken, planController.updateTaskdoneRemoveplan);

// Revive a plan by ID
router.put('/revive/:id', verifyToken, planController.revivePlan);

// Permanent Delete a plan by ID
router.delete('/permanentdelete/:id', verifyToken, planController.permanentdeletePlan);

// Create priority for a plan by ID
router.put('/priority/:id', verifyToken, planController.priorityPlan);

module.exports = router;