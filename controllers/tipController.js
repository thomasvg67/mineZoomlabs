const Tip = require('../models/Tip');

exports.getAllTips = async (req, res) => {
  try {
    const { page = 1, category = '', search = '' } = req.query;
    const PAGE_SIZE = 25;
    const skip = (page - 1) * PAGE_SIZE;

    const query = { dltSts: false };
    if (category) query.typ = category;
    if (search && search.length >= 3) {
      query.$or = [
        { typ: { $regex: search, $options: 'i' } },
        { autr: { $regex: search, $options: 'i' } },
        { src: { $regex: search, $options: 'i' } },
        { dscrptn: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Tip.countDocuments(query);
    const data = await Tip.find(query)
      .sort({ crtdOn: -1 })
      .skip(skip)
      .limit(PAGE_SIZE);

    res.json({ tip: data, totalPages: Math.ceil(total / PAGE_SIZE), currentPage: +page });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch Tips' });
  }
};

exports.addTip = async (req, res) => {
  try {
    const userId = req.user?.uId || 'system';
    const ip = req.ip;

    const newTip = new Tip({
      typ: req.body.typ,
      autr: req.body.autr,
      dscrptn: req.body.dscrptn || '',
      src: req.body.src || '',
      nofAlrt: req.body.nofAlrt || 0,
      strtFrm: req.body.strtFrm || null,
      sts: req.body.sts ?? true,
      crtdBy: userId,
      crtdIp: ip,
    });

    await newTip.save();
    res.json({ message: 'Tip added successfully', tip: newTip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add Tip' });
  }
};

exports.editTip = async (req, res) => {
  try {
    const userId = req.user?.uId || 'system';
    const ip = req.ip;

    const updated = await Tip.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          typ: req.body.typ,
          autr: req.body.autr,
          dscrptn: req.body.dscrptn,
          src: req.body.src,
          nofAlrt: req.body.nofAlrt,
          strtFrm: req.body.strtFrm,
          sts: req.body.sts,
          updtBy: userId,
          updtIp: ip,
          updtOn: new Date(),
        },
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Tip not found' });

    res.json({ message: 'Tip updated successfully', tip: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed' });
  }
};

exports.deleteTip = async (req, res) => {
  try {
    const userId = req.user?.uId || 'system';
    const ip = req.ip;

    const deleted = await Tip.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          dltSts: true,
          dltBy: userId,
          dltIp: ip,
          dltOn: new Date(),
        },
      },
      { new: true }
    );

    if (!deleted) return res.status(404).json({ message: 'Tip not found' });

    res.json({ message: 'Tip soft-deleted successfully', tip: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Deletion failed' });
  }
};
