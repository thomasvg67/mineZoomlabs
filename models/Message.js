// models/Message.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  message: { type: String, required: true },
  crtdOn: { type: Date, default: Date.now },
  crtdBy: { type: String },
  crtdIp: { type: String }
});

module.exports = mongoose.model('Message', messageSchema);
