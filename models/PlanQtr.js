const mongoose = require('mongoose');
const { Counter } = require('./Counter');

const PlanQtrSchema = new mongoose.Schema({
  nId: { type: String, unique: true }, // 4-digit string like "0001"
  title: { type: String, required: true, maxLength: 25 },
  desc: { type: String, required: true, maxLength: 100 },
  quarter: {
    type: Number,
    enum: [3, 6, 9],
    required: true
  },
  tag: { type: String, default: "" },
  isFav: { type: Boolean, default: false },
  crtdOn: { type: Date, default: Date.now },
  crtdBy: { type: String },
  crtdIp: { type: String },
  updtOn: { type: Date },
  updtBy: { type: String },
  updtIp: { type: String },
  dltOn: { type: Date },
  dltBy: { type: String },
  dltIp: { type: String },
  dltSts: { type: String, default: 0 },
  nSts: { type: String, default: 0 },
});

// 👇 This hook generates the 4-digit planQtrId
PlanQtrSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: 'nId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.nId = counter.seq.toString().padStart(4, '0');
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('PlanQtr', PlanQtrSchema);
