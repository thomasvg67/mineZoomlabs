const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');

router.get('/:stateId', cityController.getCitiesByState);

module.exports = router;
