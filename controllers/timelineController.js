const Timeline = require('../models/Timeline');

// Create a new timeline
exports.addTimeline = async (req, res) => {
  try {
    const { title, desc } = req.body;
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    const newTimeline = new Timeline({
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

    await newTimeline.save();
    res.status(201).json({
      success: true,
      message: 'Timeline saved successfully',
      timeline: newTimeline,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save timeline',
    });
  }
};

// Get all timelines (excluding deleted)
exports.getAllTimelines = async (req, res) => {
  try {
    const timelines = await Timeline.find({ dltSts: '0' }).sort({ crtdOn: -1 });
    res.json(timelines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timelines' });
  }
};

// Update tag
exports.updateTag = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    await Timeline.findByIdAndUpdate(
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

    await Timeline.findByIdAndUpdate(
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

// Soft delete timeline
exports.deleteTimeline = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    await Timeline.findByIdAndUpdate(
      req.params.id,
      {
        dltOn: new Date(),
        dltBy: userId,
        dltIp: ip,
        dltSts: '1'
      }
    );

    res.json({ success: true, message: "Timeline deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting timeline" });
  }
};

//  Update a timeline (title & description)
exports.updateTimeline = async (req, res) => {
  try {
    const { title, desc } = req.body;
    const timelineId = req.params.id;
    const ip = req.ip;
    const userId = req.user?.uid || 'system';

    // Optional: validate required fields
    if (!title || !desc) {
      return res.status(400).json({
        success: false,
        message: 'Title and Description are required',
      });
    }

    const updatedTimeline = await Timeline.findByIdAndUpdate(
      timelineId,
      {
        title,
        desc,
        updtOn: new Date(),
        updtBy: userId,
        updtIp: ip,
      },
      { new: true } // return updated doc
    );

    if (!updatedTimeline) {
      return res.status(404).json({
        success: false,
        message: 'Timeline not found',
      });
    }

    res.json({
      success: true,
      message: 'Timeline updated successfully',
      timeline: updatedTimeline,
    });
  } catch (error) {
    console.error('Error in updateTimeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update timeline',
    });
  }
};