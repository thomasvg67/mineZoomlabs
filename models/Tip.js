const mongoose = require('mongoose');

const tipSchema = new mongoose.Schema({
  cat: {type: String, default: "Tips"},
  typ: { type: String, required: true },
  autr: { type: String, required: true },
  dscrptn: { type: String },
  src: { type: String },
  nofAlrt: { type: Number, default: 0 },
  strtFrm: { type: Date },
  sts: { type: Boolean, default: true },

  // audit fields
  crtdBy: String,
  crtdIp: String,
  crtdOn: { type: Date, default: Date.now },
  updtBy: String,
  updtIp: String,
  updtOn: Date,
  dltBy: String,
  dltIp: String,
  dltOn: Date,
  dltSts: { type: Boolean, default: false },
});

module.exports = mongoose.model('Tip', tipSchema);
