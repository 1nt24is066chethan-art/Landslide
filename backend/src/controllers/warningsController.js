const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const warningsService = require('../services/warningsService');
const { validateWarningStatusInput } = require('../middleware/validate');
const { mapWarningResponse } = require('../utils/responseMapper');

const getWarnings = asyncHandler(async (req, res) => {
  const { riskLevel, status } = req.query;
  const data = await warningsService.getAllWarnings({ riskLevel, status });
  res.json({ success: true, data: data.map(mapWarningResponse) });
});

const getWarningById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    throw new ApiError(400, 'Invalid warning id. It must be a number.');
  }
  const warning = await warningsService.getWarningById(id);

  if (!warning) {
    throw new ApiError(404, `No warning found with id ${id}.`);
  }

  res.json({ success: true, data: mapWarningResponse(warning) });
});

const updateWarningStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    throw new ApiError(400, 'Invalid warning id. It must be a number.');
  }
  validateWarningStatusInput(req.body);
  const warning = await warningsService.updateWarningStatus(id, req.body.status);
  res.json({ success: true, data: mapWarningResponse(warning) });
});

module.exports = { getWarnings, getWarningById, updateWarningStatus };
