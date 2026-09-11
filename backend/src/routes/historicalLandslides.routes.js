const express = require('express');

const router = express.Router();

const historicalLandslidesController = require(
  '../controllers/historicalLandslidesController'
);

router.get(
  '/',
  historicalLandslidesController.getHistoricalLandslides
);

module.exports = router;