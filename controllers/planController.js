const Plan = require('../models/Plan');

// Get all Plan
exports.getPlanList = async (req, res) => {
  try {
    const { type } = req.query;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const planlist = await Plan.find({
      start_date: { $gte: todayStart, $lt: todayEnd },
      dlt_sts: 1,
      important: 0,
      task_done: 0,
      type
    });
    res.json(planlist);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch plan list' });
  }
};

exports.getPendingPlanList = async (req, res) => {
  try {
     const { type } = req.query;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const filter = {
      $or: [
        { start_date: { $lt: todayStart } },
        { start_date: { $gte: todayEnd } }
      ],
      dlt_sts: 1,
      important: 0,
      task_done: 0
    };
    
    if (type) filter.type = type;
    const planlist = await Plan.find(filter);

    res.json(planlist);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch plan list' });
  }
};

// Add Plan
exports.addPlan = async (req, res) => {
  try {
    const {
      task,
      description,
      start_date,
      dlt_sts,
      task_done,
      important,
      created_by,
      priority,
      type
    } = req.body;

    const plan = new Plan({
      task,
      description,
      start_date,
      dlt_sts,
      task_done,
      important,
      created_by,
      priority,
      type
    });

    await plan.save();
    res.status(201).json(plan);
  } catch (err) {
    console.error("Add Plan error:", err);
    res.status(500).json({ error: "Failed to add plan" });
  }
};

// Get single todo by ID
exports.getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch plan" });
  }
};

// delete Todo
exports.deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    plan.dlt_sts = 0,
      plan.deletedOn = Date.now(),

      await plan.save();

    res.json({ message: "Plan status changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting todo" });
  }
};

// Update Plan by ID
exports.updatePlan = async (req, res) => {
  try {
    const {
      task,
      description,
      start_date,
      dlt_sts,
      task_done,
      important
    } = req.body;

    // Find the plan first
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Todo not found" });
    }

    // Update text fields
    plan.task = task || plan.task,
      plan.description = description || plan.description,
      plan.start_date = start_date || plan.start_date,
      plan.dlt_sts = dlt_sts || plan.dlt_sts,
      plan.task_done = task_done || plan.task_done,
      plan.important = important || plan.important,
      plan.updatedOn = Date.now(),

      await plan.save();

    res.json(plan);
  } catch (err) {
    console.error("Update plan error:", err);
    res.status(500).json({ error: "Failed to update plan" });
  }
};

// Get all Trash Plan
exports.getTrashPlanList = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { dlt_sts: 0 };
    if (type) filter.type = type;

    const planlist = await Plan.find(filter);
    res.json(planlist);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trash plan list' });
  }
};

// Get all done Plan
exports.getDonePlanList = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { dlt_sts: 1, task_done: 1 };
    if (type) filter.type = type;

    const planlist = await Plan.find(filter);
    res.json(planlist);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch done plan list' });
  }
};

// Get all Important Plan
exports.getImportantPlanList = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { dlt_sts: 1, important: 1 };
    if (type) filter.type = type;

    const planlist = await Plan.find(filter);
    res.json(planlist);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch important plan list' });
  }
};

// Mark Todo as Important
exports.updateImportantplan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    plan.important = 1,
      plan.updatedOn = Date.now(),

      await plan.save();

    res.json({ message: "Plan status changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error changing status to important" });
  }
};

//Mark Todo as Task Done
exports.updateTaskdoneplan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    plan.task_done = 1,
      plan.important = 0,
      plan.updatedOn = Date.now(),

      await plan.save();

    res.json({ message: "Plan status changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error changing status to taskdone" });
  }
};

//Mark Todo as Not Task Done
exports.updateTaskdoneRemoveplan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    plan.task_done = 0,
      plan.updatedOn = Date.now(),

      await plan.save();

    res.json({ message: "Plan status changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error changing status to taskdone" });
  }
};

// Revive Todo
exports.revivePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    plan.dlt_sts = 1,
      plan.updatedOn = Date.now(),

      await plan.save();

    res.json({ message: "Plan status changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error reviving todo" });
  }
};

// Permanent Delete Todo
exports.permanentdeletePlan = async (req, res) => {
  try {
    const deleted = await Plan.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting todo" });
  }
};

// Add Priority to Todo
exports.priorityPlan = async (req, res) => {
  try {
    const {
      priority
    } = req.body;

    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    plan.priority = priority || plan.priority,
      plan.updatedOn = Date.now(),

      await plan.save();

    res.json({ message: "Plan priority changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error changing priority" });
  }
};