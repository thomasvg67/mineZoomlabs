const mongoose = require('mongoose');

const bussTypSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true,
    trim: true 
  },
  crtdOn: { type: Date, default: Date.now },
  crtdBy: { type: String },
  crtdIp: { type: String },
  updtOn: { type: Date },
  updtBy: { type: String },
  updtIp: { type: String },
  dltOn: { type: Date },
  dltBy: { type: String },
  dltIp: { type: String },
  dltSts: { type: Number, default: 0 },
  sts: { type: Number, default: 1 },
});

module.exports = mongoose.model('BussTyp', bussTypSchema);