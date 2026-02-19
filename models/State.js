const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
    _id: Number,
    countryId: {
        type: Number,
        required: true
    },
    statename: {
        type: String,
        required: true
    },
    sts: {
        type: Number,
        default: 1
    }
}, {
    collection: 'states'
});

module.exports = mongoose.model('State', stateSchema);
