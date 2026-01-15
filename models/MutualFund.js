// models/MutualFund.js
const mongoose = require('mongoose');

const mutualFundSchema = new mongoose.Schema({
  name: { type: String, required: true },          // Company / MutualFund name
  nseCode: String,
  bseCode: String,
  isin: String,
  sector: String,

  // actionType: {
  //   follow: { type: Boolean, default: false },
  //   wishlist: { type: Boolean, default: false },
  //   snoozed: { type: Boolean, default: false },
  //   other: { type: Boolean, default: false }
  // },

  actionType: {
    type: String,
    enum: ['follow', 'wishlist', 'snoozed', 'other'],
    default: 'follow'
  },

  followUp: String,
  startFrom: Date,
  description: String,

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

module.exports = mongoose.model('MutualFund', mutualFundSchema);
