const mongoose = require('mongoose');

const programmingSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    default: "Programming"
  },
  subCategory: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  source: {
    type: String,
    trim: true
  },
  tags: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true
  },

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

module.exports = mongoose.model('Programming', programmingSchema);
