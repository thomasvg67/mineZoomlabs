// controllers/contactController.js

const Alert = require('../models/Alert');
const Contact = require('../models/Contact');
const Message = require('../models/Message');

function getISTDayRange() {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const now = new Date();
  const istNow = new Date(now.getTime() + istOffset);

  const startOfToday = new Date(istNow);
  startOfToday.setHours(0, 0, 0, 0);
  startOfToday.setTime(startOfToday.getTime() - istOffset);

  const endOfToday = new Date(istNow);
  endOfToday.setHours(23, 59, 59, 999);
  endOfToday.setTime(endOfToday.getTime() - istOffset);

  return { startOfToday, endOfToday };
}

exports.addContact = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    const { message, ...contactData } = req.body; // Changed from fdback to message

    if (req.file && req.file.filename) {
      contactData.audio = [
        {
          file: req.file.filename,
          uploadedOn: new Date()
        }
      ];
    }

    const contact = new Contact({
      ...contactData,
      crtdOn: new Date(),
      crtdBy: userId,
      crtdIp: ip,
      // Removed assignedTo field
    });

    const savedContact = await contact.save();

    // save message if present
    if (message && message.trim() !== '') {
      const messageDoc = new Message({ // Assuming you create a Message model
        contactId: savedContact._id,
        message, // Changed from fdback to message
        crtdOn: new Date(),
        crtdBy: userId,
        crtdIp: ip
      });
      await messageDoc.save();
    }

    // Removed alert creation logic since nxtAlrt is now dob
    res.json(savedContact);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    let query = { dltSts: 0 };

    const search = req.query.search || "";
    const typeFilter = req.query.type || "";

    if (typeFilter.trim() !== "") {
      query.type = typeFilter;
    }

    if (search.trim() !== "") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { ph: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { hint: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } }
      ];
    }

    // ✅ DataTables params
    const draw = parseInt(req.query.draw) || 1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || 'crtdOn';
    const sortDir = req.query.sortDir === 'asc' ? 1 : -1;

    const allowedSortFields = [
      'name', 'email', 'ph', 'address', 'dob', 'crtdOn', 'type'
    ];

    const finalSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : 'crtdOn';

    const [contacts, total] = await Promise.all([
      Contact.find(query)
      .collation({ locale: 'en', strength: 2 })
        .sort({ [finalSortBy]: sortDir })
        .skip(skip)
        .limit(limit),
      Contact.countDocuments(query)
    ]);

    // ✅ DataTables REQUIRED response
    res.json({
      draw,
      recordsTotal: total,
      recordsFiltered: total,
      data: contacts
    });

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};


exports.editContact = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    const { message, ...contactData } = req.body; // Changed from fdback to message

    if (req.file && req.file.filename) {
      await Contact.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            audio: {
              file: req.file.filename,
              uploadedOn: new Date()
            }
          }
        }
      );
    }

    const updateData = {
      ...contactData,
      updtOn: new Date(),
      updtBy: userId,
      updtIp: ip,
    };

    // Removed role-based assignment logic
    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // handle message if present
    if (message && message.trim() !== '') {
      const messageDoc = new Message({
        contactId: req.params.id,
        message, // Changed from fdback to message
        crtdOn: new Date(),
        crtdBy: userId,
        crtdIp: ip
      });
      await messageDoc.save();
    }

    // Removed alert update logic since dob is not for alerts anymore

    res.json(updated);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system'; // consistent: store UID

    const deleted = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        dltOn: new Date(),
        dltBy: userId,
        dltIp: ip,
        dltSts: 1
      },
      { new: true }
    );

    // mark related alerts as deleted
    await Alert.updateMany(
      { contactId: req.params.id, dltSts: 0 },
      {
        dltOn: new Date(),
        dltBy: userId,
        dltIp: ip,
        dltSts: 1
      }
    );

    res.json(deleted);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({ success: true, contact });
  } catch (err) {
    console.error("Error fetching contact:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.checkPhoneExists = async (req, res) => {
  try {
    const { ph, excludeId } = req.query;

    if (!ph) {
      return res.json({ exists: false });
    }

    const query = {
      ph: ph,
      dltSts: 0
    };

    // While editing, exclude current record
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const contact = await Contact.findOne(query);

    res.json({ exists: !!contact });
  } catch (err) {
    res.status(500).json({ exists: false });
  }
};