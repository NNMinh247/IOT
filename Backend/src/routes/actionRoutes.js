const express = require('express');
const router = express.Router();
const actionController = require('../controllers/actionController');

router.get('/', actionController.getActionHistory);

module.exports = router;