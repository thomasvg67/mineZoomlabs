const mongoose = require('mongoose');

const medicalStatSchema = new mongoose.Schema({
  cat: { type: String, default: "Medical" },
  subCat: { type: String, required: true },
  hsptl: { type: String, required: true },
  ph: { type: String },
  cnsultdBy: { type: String },
  mesrs: { type: String, required: true },
  triglyc: { type: Number },
  ldl: { type: Number },
  hdl: { type: Number },
  vldl: { type: Number },
  chkdOn: { type: Date },
  dscrptn: { type: String },

  // Creation Info
  crtdOn: { type: Date, default: Date.now },
  crtdBy: { type: String },
  crtdIp: { type: String },

  // Update Info
  updtOn: { type: Date },
  updtBy: { type: String },
  updtIp: { type: String },

  // Deletion Info
  dltOn: { type: Date },
  dltBy: { type: String },
  dltIp: { type: String },
  dltSts: { type: Boolean, default: false },

  // General Status
  sts: { type: Boolean, default: true }
});

module.exports = mongoose.model('MedicalStat', medicalStatSchema);
