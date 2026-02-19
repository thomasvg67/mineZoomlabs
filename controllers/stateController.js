const State = require('../models/State');

exports.getStatesByCountry = async (req, res) => {
    try {
        const { countryId } = req.params;

        const parsedId = parseInt(countryId);

if (isNaN(parsedId)) {
    return res.status(400).json({ message: "Invalid countryId" });
}

const states = await State.find({
    countryId: parsedId,
    sts: 1
}).sort({ statename: 1 });

res.json(states);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch states" });
    }
};
