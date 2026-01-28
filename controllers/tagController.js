const Tag = require('../models/Tag');

// exports.addTag = async (req, res) => {
//   try {
//     const { name } = req.body;

//     const exists = await Tag.findOne({ name: name.toLowerCase() });
//     if (exists) {
//       return res.json({ success: false, message: 'Tag already exists' });
//     }

//     const tag = await Tag.create({ name: name.toLowerCase() });

//     res.json({ success: true, tag });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Failed to add tag' });
//   }
// };

exports.addTag = async (req, res) => {
  try {
    let { name, color } = req.body;

    if (!name) {
      return res.json({ success: false, message: 'Tag name required' });
    }

    name = name.trim().toLowerCase();
    color = color;

    const exists = await Tag.findOne({ name });
    if (exists) {
      return res.json({ success: false, message: 'Tag already exists' });
    }

    const tag = await Tag.create({ name, color });

    return res.json({ success: true, tag });

  } catch (err) {
    // 👇 VERY IMPORTANT
    if (err.code === 11000) {
      return res.json({ success: false, message: 'Tag already exists' });
    }

    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Failed to add tag'
    });
  }
};


exports.getTags = async (req, res) => {
  const tags = await Tag.find().sort({ name: 1 });
  res.json(tags);
};

exports.updateTag = async (req, res) => {
  try {
    let { name, color } = req.body;

    if (!name) {
      return res.json({ success: false, message: 'Tag name required' });
    }

    name = name.trim().toLowerCase();

    // 🔍 Check if another tag already exists with same name
    const exists = await Tag.findOne({
      name,
      _id: { $ne: req.params.id }
    });

    if (exists) {
      return res.json({ success: false, message: 'Tag already exists' });
    }

    const tag = await Tag.findByIdAndUpdate(
      req.params.id,
      { name, color },
      { new: true }
    );

    return res.json({ success: true, tag });

  } catch (err) {
    console.error(err);

    // 🛡 Handle duplicate key safely
    if (err.code === 11000) {
      return res.json({ success: false, message: 'Tag already exists' });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update tag'
    });
  }
};
