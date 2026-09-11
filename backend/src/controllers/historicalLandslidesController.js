const asyncHandler = require('../utils/asyncHandler');
const historicalLandslidesService = require('../services/historicalLandslidesService');

const getHistoricalLandslides = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 500,
    state,
    district,
  } = req.query;

  const result =
    await historicalLandslidesService.getHistoricalLandslides({
      page,
      limit,
      state: state?.trim() || undefined,
      district: district?.trim() || undefined,
    });

  res.json({
    success: true,
    data: result.records,
    pagination: result.pagination,
  });
});

module.exports = {
  getHistoricalLandslides,
};