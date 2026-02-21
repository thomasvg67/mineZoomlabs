const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  color: { type: String, required: true },

  crtdOn: { type: Date, default: Date.now },
  crtdBy: { type: String }, // user id

  sts: { type: Number, default: 1 },   // 1 = active, 0 = inactive
  dltSts: { type: Number, default: 0 }, // 1 = deleted

  dltOn: { type: Date },
  dltBy: { type: String }
});

module.exports = mongoose.model('Tag', TagSchema);