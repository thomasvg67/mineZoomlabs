const PlanQtr = require('../models/PlanQtr');

// Create a new planQtr
exports.addPlanQtr = async (req, res) => {
  try {
    const { title, desc, quarter } = req.body;
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    const newPlanQtr = new PlanQtr({
      title,
      desc,
      quarter,
      isFav: false,
      tag: "",
      crtdOn: new Date(),
      crtdBy: userId,
      crtdIp: ip,
      nSts: 0,
      dltSts: 0,
    });

    await newPlanQtr.save();
    res.status(201).json({
      success: true,
      message: 'PlanQtr saved successfully',
      planQtr: newPlanQtr,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save planQtr',
    });
  }
};

// Get all planQtrs (excluding deleted)
exports.getAllPlanQtrs = async (req, res) => {
  try {
    const planQtrs = await PlanQtr.find({ dltSts: '0' }).sort({ crtdOn: -1 });
    res.json(planQtrs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch planQtrs' });
  }
};

// Update tag
exports.updateTag = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    await PlanQtr.findByIdAndUpdate(
      req.params.id,
      {
        tag: req.body.tag,
        updtOn: new Date(),
        updtBy: userId,
        updtIp: ip
      }
    );

    res.json({ success: true, message: "Tag updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update tag" });
  }
};

// Update favourite status
exports.updateFavourite = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    await PlanQtr.findByIdAndUpdate(
      req.params.id,
      {
        isFav: req.body.isFav,
        updtOn: new Date(),
        updtBy: userId,
        updtIp: ip
      }
    );

    res.json({ success: true, message: "Favourite status updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update favourite status" });
  }
};

// Soft delete planQtr
exports.deletePlanQtr = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    await PlanQtr.findByIdAndUpdate(
      req.params.id,
      {
        dltOn: new Date(),
        dltBy: userId,
        dltIp: ip,
        dltSts: '1'
      }
    );

    res.json({ success: true, message: "PlanQtr deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting planQtr" });
  }
};

//  Update a planQtr (title & description)
exports.updatePlanQtr = async (req, res) => {
  try {
    const { title, desc, quarter } = req.body;
    const planQtrId = req.params.id;
    const ip = req.ip;
    const userId = req.user?.uid || 'system';

    // Optional: validate required fields
    if (!title || !desc) {
      return res.status(400).json({
        success: false,
        message: 'Title and Description are required',
      });
    }

    const updatedPlanQtr = await PlanQtr.findByIdAndUpdate(
      planQtrId,
      {
        title,
        desc,
        quarter,
        updtOn: new Date(),
        updtBy: userId,
        updtIp: ip,
      },
      { new: true } // return updated doc
    );

    if (!updatedPlanQtr) {
      return res.status(404).json({
        success: false,
        message: 'PlanQtr not found',
      });
    }

    res.json({
      success: true,
      message: 'PlanQtr updated successfully',
      planQtr: updatedPlanQtr,
    });
  } catch (error) {
    console.error('Error in updatePlanQtr:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update planQtr',
    });
  }
};