const Programming  = require('../models/Programming');

exports.addProgramming = async (req, res) => {
  try {
    const { category, subCategory, title, source, tags, active, description } = req.body;

    if (!subCategory || !title) {
      return res.status(400).json({ message: "SubCategory and Title are required" });
    }

    const programming = new Programming({
      category,
      subCategory,
      title,
      source,
      tags,
      active: active === 'true' || active === true,
      description,
      crtdBy: req.user?.uId || 'system',
      crtdIp: req.ip
    });

    await programming.save();

    res.json({ success: true, programming });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllProgramming = async (req, res) => {
  try {
    const draw = parseInt(req.query.draw) || 1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "crtdOn";
    const sortDir = req.query.sortDir === "asc" ? 1 : -1;

    const subCategory = req.query.subCategory || "";

    let query = { dltSts: 0 };

    if (subCategory && subCategory.trim() !== "") {
      query.subCategory = { $regex: `^${subCategory}$`, $options: "i" };
    }

    if (search.trim() !== "") {
      query.$or = [
        { category: { $regex: search, $options: "i" } },
        { subCategory: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { source: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const totalRecords = await Programming.countDocuments({ dltSts: 0 });
    const filteredRecords = await Programming.countDocuments(query);

    const data = await Programming.find(query)
      .sort({ [sortBy]: sortDir })
      .skip(skip)
      .limit(limit);

    res.json({
      draw,
      recordsTotal: totalRecords,
      recordsFiltered: filteredRecords,
      data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


exports.editProgramming = async (req, res) => {
  try {
    const { category, subCategory, title, source, tags, active, description } = req.body;

    if (!subCategory || !title) {
      return res.status(400).json({ message: "SubCategory and Title are required" });
    }

    const updated = await Programming.findByIdAndUpdate(
      req.params.id,
      {
        category,
        subCategory,
        title,
        source,
        tags,
        active: active === 'true' || active === true,
        description,
        updtOn: new Date(),
        updtBy: req.user?.uId || 'system',
        updtIp: req.ip
      },
      { new: true }
    );

    res.json({ success: true, updated });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


exports.deleteProgramming = async (req, res) => {
  try {
    const deleted = await Programming.findByIdAndUpdate(
      req.params.id,
      {
        dltSts: 1,
        dltOn: new Date(),
        dltBy: req.user?.uId || 'system',
        dltIp: req.ip
      },
      { new: true }
    );

    res.json({ success: true, deleted });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


exports.getProgrammingById = async (req, res) => {
  try {
    const programming = await Programming.findById(req.params.id);

    if (!programming) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ programming });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Bulk delete Programming
exports.bulkDeleteProgramming = async (req, res) => {
    try {
        const { ids } = req.body;
        const userId = req.user?.uId || 'system';

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No IDs provided' });
        }

        const result = await Programming.updateMany(
            { _id: { $in: ids }, dltSts: 0 },
            {
                dltSts: 1,
                dltOn: new Date(),
                dltBy: userId,
                dltIp: req.ip
            }
        );

        res.json({ message: `${result.modifiedCount} career(s) deleted successfully` });
    } catch (err) {
        console.error('Bulk Delete Error:', err);
        res.status(500).json({ message: 'Bulk deletion failed' });
    }
};