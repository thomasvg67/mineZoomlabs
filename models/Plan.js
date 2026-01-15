const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  task: String,
  description: String,
  start_date: Date,
  task_done: Number,
  important: Number,
  created_by: String,
  priority : String,
  type: {
    type: String,
    enum: ['future', 'yearly', 'quarterly', 'other'],
    required: true
  },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now },
  deletedOn: { type: Date, default: Date.now },
  dlt_sts: Number, 
});

module.exports = mongoose.model('Plan', planSchema);