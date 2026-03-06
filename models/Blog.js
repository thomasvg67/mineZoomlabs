const mongoose = require('mongoose');

const blogTemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
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
  dltSts: { type: Number, default: 0 }
});

module.exports = mongoose.model('Blog', blogTemplateSchema);