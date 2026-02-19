const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
     _id: Number,
    sortname: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phonecode: {
        type: Number,
        required: true
    },
    sts: {
        type: Number,
        default: 1 // 1 = active, 0 = inactive
    }
}, {
    collection: 'cntries',
    timestamps: true
});

module.exports = mongoose.model('Country', countrySchema);
