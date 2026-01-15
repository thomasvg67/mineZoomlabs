// controllers/shareController.js
const Share = require('../models/Share');

/**
 * ADD SHARE
 */
exports.addShare = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    const share = new Share({
      ...req.body,
      crtdOn: new Date(),
      crtdBy: userId,
      crtdIp: ip
    });

    const savedShare = await share.save();
    res.json(savedShare);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

/**
 * GET ALL SHARES (DataTables compatible)
 */
exports.getAllShares = async (req, res) => {
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

    const [shares, total] = await Promise.all([
      Share.find(query)
        .collation({ locale: 'en', strength: 2 })
        .sort({ [sortBy]: sortDir })
        .skip(skip)
        .limit(limit),
      Share.countDocuments(query)
    ]);

    res.json({
      draw,
      recordsTotal: total,
      recordsFiltered: total,
      data: shares
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

/**
 * EDIT SHARE
 */
exports.editShare = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    const updated = await Share.findByIdAndUpdate(
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
exports.deleteShare = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    const deleted = await Share.findByIdAndUpdate(
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
exports.getShareById = async (req, res) => {
  try {
    const share = await Share.findById(req.params.id);
    if (!share) {
      return res.status(404).json({ message: 'Share not found' });
    }
    res.json({ success: true, share });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
