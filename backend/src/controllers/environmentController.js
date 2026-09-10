const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const environmentService = require('../services/environmentService');
const { mapEnvironmentResponse } = require('../utils/responseMapper');

const getEnvironmentForLocation = asyncHandler(async (req, res) => {
  const locationId = Number(req.params.id);
  if (!Number.isInteger(locationId)) {
    throw new ApiError(400, 'Invalid location id. It must be a number.');
  }
  const all = req.query.all === 'true';

  const data = all
    ? await environmentService.getEnvironmentHistoryForLocation(locationId)
    : await environmentService.getLatestEnvironmentForLocation(locationId);

  if (Array.isArray(data)) {
    res.json({ success: true, data: data.map(mapEnvironmentResponse) });
  } else if (data) {
    res.json({ success: true, data: mapEnvironmentResponse(data) });
  } else {
    throw new ApiError(404, `No environment data found for location ${locationId}.`);
  }
});

module.exports = { getEnvironmentForLocation };
