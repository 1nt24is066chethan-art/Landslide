const ApiError = require('../utils/ApiError');

const VALID_RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH'];
const VALID_CITIZEN_REPORT_STATUSES = ['PENDING', 'REVIEWED', 'RESOLVED'];
const VALID_WARNING_STATUSES = ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'];

/**
 * Validates the body of POST /api/risk (a new risk prediction, e.g.
 * from the future ML system). Throws ApiError(400, ...) on the first
 * problem found.
 */
function validateRiskPredictionInput(body = {}) {
  const { location_id, risk_score, risk_level } = body;

  if (!Number.isInteger(location_id)) {
    throw new ApiError(400, 'location_id must be an integer.');
  }

  const score = Number(risk_score);
  if (Number.isNaN(score) || score < 0 || score > 100) {
    throw new ApiError(400, 'risk_score must be a number between 0 and 100.');
  }

  if (!VALID_RISK_LEVELS.includes(String(risk_level).toUpperCase())) {
    throw new ApiError(
      400,
      `risk_level must be one of ${VALID_RISK_LEVELS.join(', ')}.`
    );
  }
}

/**
 * Validates the body of POST /api/citizen-reports.
 */
function validateCitizenReportInput(body = {}) {
  const { location_name, district, state, category, description } = body;

  const missing = [];
  if (!location_name) missing.push('location_name');
  if (!district) missing.push('district');
  if (!state) missing.push('state');
  if (!category) missing.push('category');
  if (!description) missing.push('description');

  if (missing.length > 0) {
    throw new ApiError(400, `Missing required field(s): ${missing.join(', ')}`);
  }
}

/**
 * Validates the body of PATCH /api/citizen-reports/:id/status.
 * Kept in sync with the CHECK constraint on citizen_reports.status
 * in schema.sql — if that list ever changes, update both places.
 */
function validateCitizenReportStatusInput(body = {}) {
  const { status } = body;

  if (!status || !VALID_CITIZEN_REPORT_STATUSES.includes(String(status).toUpperCase())) {
    throw new ApiError(
      400,
      `status must be one of ${VALID_CITIZEN_REPORT_STATUSES.join(', ')}.`
    );
  }
}

/**
 * Validates the body of PATCH /api/warnings/:id/status.
 * Kept in sync with the CHECK constraint on early_warnings.status
 * in schema.sql — if that list ever changes, update both places.
 */
function validateWarningStatusInput(body = {}) {
  const { status } = body;

  if (!status || !VALID_WARNING_STATUSES.includes(String(status).toUpperCase())) {
    throw new ApiError(
      400,
      `status must be one of ${VALID_WARNING_STATUSES.join(', ')}.`
    );
  }
}

module.exports = {
  validateRiskPredictionInput,
  validateCitizenReportInput,
  validateCitizenReportStatusInput,
  validateWarningStatusInput,
  VALID_RISK_LEVELS,
  VALID_CITIZEN_REPORT_STATUSES,
  VALID_WARNING_STATUSES,
};
