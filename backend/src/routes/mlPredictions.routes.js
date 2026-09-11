const express = require('express');

const router = express.Router();

const riskController = require('../controllers/riskController');

const {
  predictRisk,
  predictLocationRisk,
} = require('../controllers/mlPredictionController');

/*
 * Existing prediction-storage endpoint.
 *
 * DO NOT REMOVE.
 *
 * POST /api/ml/predictions
 */
router.post(
  '/',
  riskController.createRisk
);

/*
 * Direct ML inference using explicitly supplied
 * 12-feature JSON.
 *
 * POST /api/ml/predictions/predict-risk
 */
router.post(
  '/predict-risk',
  predictRisk
);

/*
 * ML inference for an existing dashboard location.
 *
 * The backend resolves the location to the nearest
 * historical rainfall-linked event, combines that
 * event with its master static features, and runs
 * the existing Python model.
 *
 * POST /api/ml/predictions/predict-location/:locationId
 */
router.post(
  '/predict-location/:locationId',
  predictLocationRisk
);

module.exports = router;