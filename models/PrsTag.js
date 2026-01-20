const mongoose = require('mongoose');

const PrsTagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  color: {type: String, required: true,},
  crtdOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PrsTag', PrsTagSchema);
