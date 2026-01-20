const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  color: {type: String, required: true,},
  crtdOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tag', TagSchema);
