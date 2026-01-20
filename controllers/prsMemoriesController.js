const Memory = require('../models/PrsMemories');

/**
 * ADD MEMORY
 */
exports.addMemory = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    const memory = new Memory({
      ...req.body,
      crtdOn: new Date(),
      crtdBy: userId,
      crtdIp: ip
    });

    const savedMemory = await memory.save();
    res.json(savedMemory);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

/**
 * GET ALL MEMORIES (DataTables compatible)
 */
exports.getAllMemories = async (req, res) => {
  try {
    let query = { dltSts: 0 };

    const search = req.query.search || '';
    const type = req.query.type || '';

    if (type) {
      query.type = type;
    }

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { ph: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    // DataTables params
    const draw = parseInt(req.query.draw) || 1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || 'crtdOn';
    const sortDir = req.query.sortDir === 'asc' ? 1 : -1;

    const [memories, total] = await Promise.all([
      Memory.find(query)
        .collation({ locale: 'en', strength: 2 })
        .sort({ [sortBy]: sortDir })
        .skip(skip)
        .limit(limit),
      Memory.countDocuments(query)
    ]);

    res.json({
      draw,
      recordsTotal: total,
      recordsFiltered: total,
      data: memories
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

/**
 * EDIT MEMORY
 */
exports.editMemory = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    const updated = await Memory.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updtOn: new Date(),
        updtBy: userId,
        updtIp: ip
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

/**
 * DELETE MEMORY (Soft delete)
 */
exports.deleteMemory = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    const deleted = await Memory.findByIdAndUpdate(
      req.params.id,
      {
        dltOn: new Date(),
        dltBy: userId,
        dltIp: ip,
        dltSts: 1
      },
      { new: true }
    );

    res.json(deleted);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

/**
 * GET MEMORY BY ID
 */
exports.getMemoryById = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    res.json({ success: true, memory });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
