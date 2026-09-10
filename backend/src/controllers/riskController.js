const asyncHandler = require('../utils/asyncHandler');
const riskService = require('../services/riskService');
const { validateRiskPredictionInput } = require('../middleware/validate');
const { mapRiskPredictionResponse } = require('../utils/responseMapper');

const getRisk = asyncHandler(async (req, res) => {
  const data = await riskService.getLatestRiskForAllLocations();
  res.json({ success: true, data: data.map(mapRiskPredictionResponse) });
});

const getRiskForLocation = asyncHandler(async (req, res) => {
  const locationId = Number(req.params.id);
  if (!Number.isInteger(locationId)) {
    throw new ApiError(400, 'Invalid location id. It must be a number.');
  }
  const all = req.query.all === 'true';
  const data = await riskService.getRiskHistoryForLocation(locationId, { all });
  if (Array.isArray(data)) {
    res.json({ success: true, data: data.map(mapRiskPredictionResponse) });
  } else {
    res.json({ success: true, data: data ? mapRiskPredictionResponse(data) : null });
  }
});

/**
 * Intended for the future ML system: stores a new prediction for a
 * location. See DATABASE_DESIGN.md for the exact JSON shape expected.
 */
const createRisk = asyncHandler(async (req, res) => {
  validateRiskPredictionInput(req.body);
  const prediction = await riskService.createRiskPrediction(req.body);
  res.status(201).json({ success: true, data: mapRiskPredictionResponse(prediction) });
});

module.exports = { getRisk, getRiskForLocation, createRisk };
