const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');

// GET countries
router.get('/', countryController.getCountries);

module.exports = router;
