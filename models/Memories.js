const mongoose = require('mongoose');

const memoriesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  ph: String,
  address: String,
  dob: Date,
  type: String,            // Birthday / Wedding / Anniversary / Other
  message: String,         // CKEditor HTML

  sts: { type: Boolean, default: true },

  crtdOn: { type: Date, default: Date.now },
  crtdBy: String,
  crtdIp: String,

  updtOn: Date,
  updtBy: String,
  updtIp: String,

  dltOn: Date,
  dltBy: String,
  dltIp: String,
  dltSts: { type: Number, default: 0 }
});

module.exports = mongoose.model('Memories', memoriesSchema);
