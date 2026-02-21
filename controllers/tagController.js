const Tag = require('../models/Tag');
const Note = require('../models/Note');

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
  const tags = await Tag.find({ dltSts: 0, sts: 1 }).sort({ name: 1 });
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

exports.deleteTag = async (req, res) => {
  try {
    const tagId = req.params.id;
    const userId = req.user?.uId || 'system';

    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    // 🔍 Count notes using this tag (not deleted notes)
    const noteCount = await Note.countDocuments({
      tag: tag.name,
      dltSts: 0
    });

    if (noteCount > 0) {
      return res.json({
        success: false,
        noteCount,
        message: `This tag contains ${noteCount} notes, so can't delete`
      });
    }

    // ✅ Soft delete
    await Tag.findByIdAndUpdate(tagId, {
      sts: 0,
      dltSts: 1,
      dltOn: new Date(),
      dltBy: userId
    });

    return res.json({
      success: true,
      message: 'Tag deleted successfully'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete tag'
    });
  }
};