const mongoose = require('mongoose');

const pandlSchema = new mongoose.Schema({
  nme: { type: String }, // Client name from suggestions
  clntId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' }, // Reference to Client
  adrs: { type: String }, // Address
  title: { type: String }, // Title/Description
  amnt: { type: Number, required: true }, // Amount
  trnstnTyp: { type: String }, // Transaction Type: sales/income/expense
  pymntTyp: { type: String }, // Payment Type: cash/check/upi/account transfer
  pandlTyp: { type: String }, // 'cr' for sales/income, 'db' for expense
  desc: { type: String }, // Description/Rich text
  img: [{
    file: String,
    uploadedOn: { type: Date, default: Date.now }
  }],
  audio: [{
    file: String,
    uploadedOn: { type: Date, default: Date.now }
  }],
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
  sts: { type: Number, default: 0 }
});

module.exports = mongoose.model('PandL', pandlSchema);