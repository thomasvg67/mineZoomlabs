const Note = require('../models/Note');

// Create a new note
exports.addNote = async (req, res) => {
  try {
    const { title, desc, tag } = req.body;
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    const newNote = new Note({
      title,
      desc,
      isFav: false,
      tag,
      crtdOn: new Date(),
      crtdBy: userId,
      crtdIp: ip,
      nSts: 3,
      dltSts: 0,
    });

    await newNote.save();
    res.status(201).json({
      success: true,
      message: 'Note saved successfully',
      note: newNote,
    });
  } catch (error) {
    // res.status(500).json({
    //   success: false,
    //   message: 'Failed to save note',
    // });
     console.error("ADD NOTE ERROR:", error);   // 👈 ADD THIS
  res.status(500).json({
    success: false,
    message: error.message,
  });
  }
};

// Get all notes (excluding deleted)
exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find({ dltSts: '0' }).sort({ crtdOn: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

// Update tag
exports.updateTag = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    await Note.findByIdAndUpdate(
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

    await Note.findByIdAndUpdate(
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

// Soft delete note
exports.deleteNote = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    await Note.findByIdAndUpdate(
      req.params.id,
      {
        dltOn: new Date(),
        dltBy: userId,
        dltIp: ip,
        dltSts: '1'
      }
    );

    res.json({ success: true, message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting note" });
  }
};

//  Update a note (title & description)
exports.updateNote = async (req, res) => {
  try {
    const { title, desc } = req.body;
    const noteId = req.params.id;
    const ip = req.ip;
    const userId = req.user?.uid || 'system';

    // Optional: validate required fields
    if (!title || !desc) {
      return res.status(400).json({
        success: false,
        message: 'Title and Description are required',
      });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      {
        title,
        desc,
        updtOn: new Date(),
        updtBy: userId,
        updtIp: ip,
      },
      { new: true } // return updated doc
    );

    if (!updatedNote) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.json({
      success: true,
      message: 'Note updated successfully',
      note: updatedNote,
    });
  } catch (error) {
    console.error('Error in updateNote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update note',
    });
  }
};