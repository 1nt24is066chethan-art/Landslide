const express = require('express');
const router = express.Router();

const riskController = require('../controllers/riskController');

router.post('/', riskController.createRisk);

module.exports = router;