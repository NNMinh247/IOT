const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

router.get('/data', sensorController.getSensorData);

router.post('/data', sensorController.receiveSensorData);

module.exports = router;