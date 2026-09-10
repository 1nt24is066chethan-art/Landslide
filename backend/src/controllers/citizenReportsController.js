const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const citizenReportsService = require('../services/citizenReportsService');
const { validateCitizenReportInput, validateCitizenReportStatusInput } = require('../middleware/validate');
const { mapCitizenReportResponse } = require('../utils/responseMapper');

const getCitizenReports = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const data = await citizenReportsService.getAllCitizenReports({ status });
  res.json({ success: true, data: data.map(mapCitizenReportResponse) });
});

const getCitizenReportById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    throw new ApiError(400, 'Invalid citizen report id. It must be a number.');
  }
  const report = await citizenReportsService.getCitizenReportById(id);

  if (!report) {
    throw new ApiError(404, `No citizen report found with id ${id}.`);
  }

  res.json({ success: true, data: mapCitizenReportResponse(report) });
});

const createCitizenReport = asyncHandler(async (req, res) => {
  validateCitizenReportInput(req.body);
  const report = await citizenReportsService.createCitizenReport(req.body);
  res.status(201).json({ success: true, data: mapCitizenReportResponse(report) });
});

const updateCitizenReportStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    throw new ApiError(400, 'Invalid citizen report id. It must be a number.');
  }
  validateCitizenReportStatusInput(req.body);
  const report = await citizenReportsService.updateCitizenReportStatus(id, req.body.status);
  res.json({ success: true, data: mapCitizenReportResponse(report) });
});

module.exports = { getCitizenReports, getCitizenReportById, createCitizenReport, updateCitizenReportStatus };
