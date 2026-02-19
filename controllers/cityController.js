const City = require('../models/City');

exports.getCitiesByState = async (req, res) => {
    try {
        const { stateId } = req.params;

        const parsedId = parseInt(stateId);

if (isNaN(parsedId)) {
    return res.status(400).json({ message: "Invalid stateId" });
}

const cities = await City.find({
    state_id: parsedId,
    sts: 1
}).sort({ cityName: 1 });

res.json(cities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch cities" });
    }
};
