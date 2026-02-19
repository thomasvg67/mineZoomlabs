const express = require('express');
const router = express.Router();
const stateController = require('../controllers/stateController');

router.get('/:countryId', stateController.getStatesByCountry);

module.exports = router;
