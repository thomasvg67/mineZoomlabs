const Message = require('../models/Message');

exports.getMessagesByContactId = async (req, res) => {
  try {
    const messages = await Message.find({ contactId: req.params.contactId }).sort({ crtdOn: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
