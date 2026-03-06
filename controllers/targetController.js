const Target = require('../models/Target');

// Get all Target for Inbox (today or future)
exports.getTargetList = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetlist = await Target.find({
      start_date: { $gte: today }, // Greater than or equal to today
      dlt_sts: 1,
      important: 0,
      task_done: 0
    }).sort({ start_date: 1 }); // Sort by date ascending
    
    res.json(targetlist);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch target list' });
  }
};

// Get Pending Target (past dates)
exports.getPendingTargetList = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetlist = await Target.find({
      start_date: { $lt: today }, // Less than today (past dates)
      dlt_sts: 1,
      important: 0,
      task_done: 0
    }).sort({ start_date: 1 }); // Sort by date ascending
    
    res.json(targetlist);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending target list' });
  }
};

// Add Target
exports.addTodolist = async (req, res) => {
  try {
    const {
    task,
    description,
    start_date,
    dlt_sts,
    task_done,
    important,
    created_by,
    priority
    } = req.body;

    const target = new Target({
        task,
        description,
        start_date,
        dlt_sts,
        task_done,
        important,
        created_by,
        priority
    });

    await target.save();
    res.status(201).json(target);
  } catch (err) {
    console.error("Add Target error:", err);
    res.status(500).json({ error: "Failed to add target" });
  }
};

// Get single todo by ID
exports.getTodolistById = async (req, res) => {
  try {
    const target = await Target.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ error: "Target not found" });
    }
    res.json(target);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch target" });
  }
};

// delete Todo
exports.deleteTodolist = async (req, res) => {
  try {
    const target = await Target.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ error: "Target not found" });
    }
    target.dlt_sts = 0 ,
    target.deletedOn = Date.now(),

    await target.save();

    res.json({ message: "Target status changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting todo" });
  }
};

// Update Todolist by ID
exports.updateTodolist = async (req, res) => {
  try {
    const {
    task,
    description,
    start_date,
    dlt_sts,
    task_done,
    important
    } = req.body;

    // Find the target first
    const target = await Target.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ error: "Todo not found" });
    }

    // Update text fields
    target.task = task || target.task,
    target.description = description || target.description,
    target.start_date = start_date || target.start_date,
    target.dlt_sts = dlt_sts || target.dlt_sts,
    target.task_done = task_done || target.task_done,
    target.important = important || target.important,
    target.updatedOn = Date.now(),

    await target.save();

    res.json(target);
  } catch (err) {
    console.error("Update target error:", err);
    res.status(500).json({ error: "Failed to update target" });
  }
};

// Get all Trash Target
exports.getTrashTargetList = async (req, res) => {
  try {
    const targetlist = await Target.find({"dlt_sts": 0});
    res.json(targetlist);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trash target list' });
  }
};

// Get all done Target
exports.getDoneTargetList = async (req, res) => {
  try {
    const targetlist = await Target.find({"dlt_sts": 1, "task_done" : 1});
    res.json(targetlist);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch done target list' });
  }
};

// Get all Important Target
exports.getImportantTargetList = async (req, res) => {
  try {
    const targetlist = await Target.find({"dlt_sts": 1, "important" : 1});
    res.json(targetlist);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch important target list' });
  }
};

// Mark Todo as Important
exports.updateImportanttargetlist = async (req, res) => {
  try {
    const target = await Target.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ error: "Target not found" });
    }
    target.important = 1 ,
    target.updatedOn = Date.now(),

    await target.save();

    res.json({ message: "Target status changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error changing status to important" });
  }
};

//Mark Todo as Task Done
exports.updateTaskdonetargetlist = async (req, res) => {
  try {
    const target = await Target.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ error: "Target not found" });
    }
    target.task_done = 1 ,
    target.important = 0 ,
    target.updatedOn = Date.now(),

    await target.save();

    res.json({ message: "Target status changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error changing status to taskdone" });
  }
};

//Mark Todo as Not Task Done
exports.updateTaskdoneRemovetargetlist = async (req, res) => {
  try {
    const target = await Target.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ error: "Target not found" });
    }
    target.task_done = 0 ,
    target.updatedOn = Date.now(),

    await target.save();

    res.json({ message: "Target status changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error changing status to taskdone" });
  }
};

// Revive Todo
exports.reviveTodolist = async (req, res) => {
  try {
    const target = await Target.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ error: "Target not found" });
    }
    target.dlt_sts = 1 ,
    target.updatedOn = Date.now(),

    await target.save();

    res.json({ message: "Target status changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error reviving todo" });
  }
};

// Permanent Delete Todo
exports.permanentdeleteTodolist = async (req, res) => {
  try {
    const deleted = await Target.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting todo" });
  }
};

// Add Priority to Todo
exports.priorityTodolist = async (req, res) => {
  try {
    const {
    priority
    } = req.body;

    const target = await Target.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ error: "Target not found" });
    }
    target.priority = priority || target.priority,
    target.updatedOn = Date.now(),

    await target.save();

    res.json({ message: "Target priority changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error changing priority" });
  }
};