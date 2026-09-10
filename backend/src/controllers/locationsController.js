const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const locationsService = require('../services/locationsService');
const {
  mapLocationResponse,
  mapRiskPredictionResponse,
  mapSearchLocationResponse,
} = require('../utils/responseMapper');

const getLocations = asyncHandler(async (req, res) => {
  const { riskLevel } = req.query;
  const locations = await locationsService.getAllLocations({ riskLevel });
  res.json({ success: true, data: locations.map(mapLocationResponse) });
});

const getLocationById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    throw new ApiError(400, 'Invalid location id. It must be a number.');
  }
  const location = await locationsService.getLocationById(id);

  if (!location) {
    throw new ApiError(404, `No location found with id ${id}.`);
  }

  res.json({ success: true, data: mapLocationResponse(location) });
});

const searchLocations = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();

  if (!q) {
    throw new ApiError(400, 'Query parameter "q" is required, e.g. /api/locations/search?q=Shillong');
  }

  const results = await locationsService.searchLocations(q);
  res.json({ success: true, data: results.map(mapSearchLocationResponse) });
});

module.exports = { getLocations, getLocationById, searchLocations };
