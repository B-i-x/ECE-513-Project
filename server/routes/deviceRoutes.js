const express = require('express');
const router = express.Router();

// Import the controller
const deviceController = require('../controllers/deviceController');

// POST endpoint for /device/start/
router.post('/start/', deviceController.startDevice);

module.exports = router;