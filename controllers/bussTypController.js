const BussTyp = require('../models/BussTyp');

// Get all business types
exports.getAllBussTypes = async (req, res) => {
  try {
    const bussTypes = await BussTyp.find({ dltSts: 0 }).sort({ name: 1 });
    res.json(bussTypes);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

// Add new business type
exports.addBussType = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uid || 'system';
    let { name } = req.body;

    // Capitalize first letter of each word
    name = name.trim().replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    // Check if already exists (case-insensitive)
    const existing = await BussTyp.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existing) {
      if (existing.dltSts === 1) {
        // Restore if soft-deleted
        existing.dltSts = 0;
        existing.dltOn = null;
        existing.dltBy = null;
        existing.dltIp = null;
        existing.updtOn = new Date();
        existing.updtBy = userId;
        existing.updtIp = ip;
        await existing.save();
        return res.status(200).json(existing);
      }
      return res.status(400).json({ message: 'Business type already exists' });
    }

    const bussType = new BussTyp({
      name: name,
      crtdOn: new Date(),
      crtdBy: userId, // Save the user's uid
      crtdIp: ip
    });

    const saved = await bussType.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};