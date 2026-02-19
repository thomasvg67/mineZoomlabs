const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    _id: Number,
    state_id: {
        type: Number,
        required: true
    },
    cityName: {
        type: String,
        required: true
    },
    sts: {
        type: Number,
        default: 1
    }
}, {
    collection: 'cities'
});

module.exports = mongoose.model('City', citySchema);
