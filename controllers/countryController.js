const Country = require('../models/Country');

// Get all active countries
exports.getCountries = async (req, res) => {
    try {
        const countries = await Country
            .find({ sts: 1 })
            .sort({ name: 1 });

        res.status(200).json(countries);
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({ message: 'Failed to fetch countries' });
    }
};
