// controllers/mutualFundController.js
const MutualFund = require('../models/MutualFund');

/**
 * ADD SHARE
 */
exports.addMutualFund = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    const mutualFund = new MutualFund({
      ...req.body,
      crtdOn: new Date(),
      crtdBy: userId,
      crtdIp: ip
    });

    const savedMutualFund = await mutualFund.save();
    res.json(savedMutualFund);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

/**
 * GET ALL SHARES (DataTables compatible)
 */
exports.getAllMutualFunds = async (req, res) => {
  try {
    let query = { dltSts: 0 };

    const search = req.query.search || '';
    const type = req.query.type || ''; // dropdown filter

    // Apply type filter if selected
    if (type) {
      query.actionType = type;
    }

    // Apply search across multiple fields
    if (search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nseCode: { $regex: search, $options: 'i' } },
        { bseCode: { $regex: search, $options: 'i' } },
        { sector: { $regex: search, $options: 'i' } }
      ];
    }

    // DataTables params
    const draw = parseInt(req.query.draw) || 1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || 'crtdOn';
    const sortDir = req.query.sortDir === 'asc' ? 1 : -1;

    const [mutualFunds, total] = await Promise.all([
      MutualFund.find(query)
        .collation({ locale: 'en', strength: 2 })
        .sort({ [sortBy]: sortDir })
        .skip(skip)
        .limit(limit),
      MutualFund.countDocuments(query)
    ]);

    res.json({
      draw,
      recordsTotal: total,
      recordsFiltered: total,
      data: mutualFunds
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

/**
 * EDIT SHARE
 */
exports.editMutualFund = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    const updated = await MutualFund.findByIdAndUpdate(
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
 * DELETE SHARE (Soft delete)
 */
exports.deleteMutualFund = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    const deleted = await MutualFund.findByIdAndUpdate(
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
 * GET SHARE BY ID
 */
exports.getMutualFundById = async (req, res) => {
  try {
    const mutualFund = await MutualFund.findById(req.params.id);
    if (!mutualFund) {
      return res.status(404).json({ message: 'MutualFund not found' });
    }
    res.json({ success: true, mutualFund });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
