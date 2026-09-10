const asyncHandler = require('../utils/asyncHandler');
const dashboardService = require('../services/dashboardService');
const { mapDashboardSummaryResponse } = require('../utils/responseMapper');

const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getDashboardSummary();
  res.json({ success: true, data: mapDashboardSummaryResponse(summary) });
});

module.exports = { getDashboardSummary };
