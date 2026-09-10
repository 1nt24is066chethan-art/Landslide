const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const vulnerableInfrastructureService = require('../services/vulnerableInfrastructureService');
const {
  mapVulnerableRoadResponse,
  mapVulnerableVillageResponse,
} = require('../utils/responseMapper');

const getVulnerableRoadsForLocation = asyncHandler(async (req, res) => {
  const locationId = Number(req.params.id);
  if (!Number.isInteger(locationId)) {
    throw new ApiError(400, 'Invalid location id. It must be a number.');
  }

  const data = await vulnerableInfrastructureService.getVulnerableRoadsForLocation(locationId);
  if (data === null) {
    throw new ApiError(404, `No location found with id ${locationId}.`);
  }
  res.json({ success: true, data: data.map(mapVulnerableRoadResponse) });
});

const getVulnerableVillagesForLocation = asyncHandler(async (req, res) => {
  const locationId = Number(req.params.id);
  if (!Number.isInteger(locationId)) {
    throw new ApiError(400, 'Invalid location id. It must be a number.');
  }

  const data = await vulnerableInfrastructureService.getVulnerableVillagesForLocation(locationId);
  if (data === null) {
    throw new ApiError(404, `No location found with id ${locationId}.`);
  }
  res.json({ success: true, data: data.map(mapVulnerableVillageResponse) });
});

module.exports = {
  getVulnerableRoadsForLocation,
  getVulnerableVillagesForLocation,
};