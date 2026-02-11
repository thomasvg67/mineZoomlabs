// models/TimelineTag.js
const mongoose = require('mongoose');

const TimelineTagSchema = new mongoose.Schema({
  name: String,
  color: String,
  crtdOn: Date
});

module.exports = mongoose.model('TimelineTag', TimelineTagSchema);
