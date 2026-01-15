const BudgetQtr = require('../models/BudgetQtr');

// Create a new budgetQtr
exports.addBudgetQtr = async (req, res) => {
  try {
    const { title, desc } = req.body;
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    const newBudgetQtr = new BudgetQtr({
      title,
      desc,
      isFav: false,
      tag: "",
      crtdOn: new Date(),
      crtdBy: userId,
      crtdIp: ip,
      nSts: 0,
      dltSts: 0,
    });

    await newBudgetQtr.save();
    res.status(201).json({
      success: true,
      message: 'BudgetQtr saved successfully',
      budgetQtr: newBudgetQtr,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save budgetQtr',
    });
  }
};

// Get all budgetQtrs (excluding deleted)
exports.getAllBudgetQtrs = async (req, res) => {
  try {
    const budgetQtrs = await BudgetQtr.find({ dltSts: '0' }).sort({ crtdOn: -1 });
    res.json(budgetQtrs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budgetQtrs' });
  }
};

// Update tag
exports.updateTag = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    await BudgetQtr.findByIdAndUpdate(
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

    await BudgetQtr.findByIdAndUpdate(
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

// Soft delete budgetQtr
exports.deleteBudgetQtr = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    await BudgetQtr.findByIdAndUpdate(
      req.params.id,
      {
        dltOn: new Date(),
        dltBy: userId,
        dltIp: ip,
        dltSts: '1'
      }
    );

    res.json({ success: true, message: "BudgetQtr deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting budgetQtr" });
  }
};

//  Update a budgetQtr (title & description)
exports.updateBudgetQtr = async (req, res) => {
  try {
    const { title, desc } = req.body;
    const budgetQtrId = req.params.id;
    const ip = req.ip;
    const userId = req.user?.uid || 'system';

    // Optional: validate required fields
    if (!title || !desc) {
      return res.status(400).json({
        success: false,
        message: 'Title and Description are required',
      });
    }

    const updatedBudgetQtr = await BudgetQtr.findByIdAndUpdate(
      budgetQtrId,
      {
        title,
        desc,
        updtOn: new Date(),
        updtBy: userId,
        updtIp: ip,
      },
      { new: true } // return updated doc
    );

    if (!updatedBudgetQtr) {
      return res.status(404).json({
        success: false,
        message: 'BudgetQtr not found',
      });
    }

    res.json({
      success: true,
      message: 'BudgetQtr updated successfully',
      budgetQtr: updatedBudgetQtr,
    });
  } catch (error) {
    console.error('Error in updateBudgetQtr:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update budgetQtr',
    });
  }
};