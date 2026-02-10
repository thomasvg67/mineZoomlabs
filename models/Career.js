const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: String,
    required: true,
    trim: true
  },
  skills: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  img: [
    {
      file: String,
      uploadedOn: Date
    }
  ],
  audio: [{
    file: String,
    uploadedOn: { type: Date, default: Date.now }
  }],
  documents: [
    {
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      uploadedOn: { type: Date, default: Date.now }
    }
  ],
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

module.exports = mongoose.model('Career', careerSchema);