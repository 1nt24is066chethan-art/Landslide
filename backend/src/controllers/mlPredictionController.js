const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const {
  runPythonPrediction,
  runLocationPrediction,
} = require('../services/mlPredictionService');

const riskService = require('../services/riskService');
const locationsService = require('../services/locationsService');

const REQUIRED_FIELDS = [
  'state',
  'elevation_m',
  'slope_deg',
  'aspect_deg',
  'lulc_class',
  'clay_surface_pct',
  'road_distance_m',
  'settlement_distance_m',
  'rainfall_24h_mm',
  'rainfall_72h_mm',
  'rainfall_7d_mm',
  'rainfall_15d_mm',
];

function validatePredictionInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(
      400,
      'Prediction input must be a JSON object.'
    );
  }

  for (const field of REQUIRED_FIELDS) {
    if (
      body[field] === undefined ||
      body[field] === null ||
      body[field] === ''
    ) {
      throw new ApiError(
        400,
        `Missing required prediction feature: ${field}`
      );
    }
  }

  if (
    typeof body.state !== 'string' ||
    !body.state.trim()
  ) {
    throw new ApiError(
      400,
      'state must be a non-empty string.'
    );
  }

  const numericFields = REQUIRED_FIELDS.filter(
    (field) => field !== 'state'
  );

  for (const field of numericFields) {
    const value = Number(body[field]);

    if (!Number.isFinite(value)) {
      throw new ApiError(
        400,
        `${field} must be a finite number.`
      );
    }
  }

  const rainfallFields = [
    'rainfall_24h_mm',
    'rainfall_72h_mm',
    'rainfall_7d_mm',
    'rainfall_15d_mm',
  ];

  for (const field of rainfallFields) {
    if (Number(body[field]) < 0) {
      throw new ApiError(
        400,
        `${field} cannot be negative.`
      );
    }
  }
}

async function savePrediction({
  locationId,
  result,
  modelVersion,
}) {
  return riskService.createRiskPrediction({
    location_id: locationId,
    risk_score: Number(
      (result.risk_score * 100).toFixed(2)
    ),
    risk_level: result.risk_level,
    model_version:
      modelVersion ||
      'static-rf-plus-rainfall-lr-v1',
  });
}

const predictRisk = asyncHandler(
  async (req, res) => {
    validatePredictionInput(req.body);

    const {
      location_id,
      model_version,
      ...predictionInput
    } = req.body;

    const result = await runPythonPrediction(
      predictionInput
    );

    if (
      typeof result.susceptibility_probability !== 'number' ||
      typeof result.rainfall_probability !== 'number' ||
      typeof result.risk_score !== 'number' ||
      typeof result.risk_level !== 'string'
    ) {
      throw new ApiError(
        502,
        'ML prediction returned an invalid response.'
      );
    }

    let savedPrediction = null;

    if (
      location_id !== undefined &&
      location_id !== null
    ) {
      const numericLocationId = Number(
        location_id
      );

      if (!Number.isInteger(numericLocationId)) {
        throw new ApiError(
          400,
          'location_id must be an integer.'
        );
      }

      savedPrediction = await savePrediction({
        locationId: numericLocationId,
        result,
        modelVersion: model_version,
      });
    }

    res.json({
      success: true,
      data: {
        susceptibilityProbability:
          result.susceptibility_probability,

        rainfallProbability:
          result.rainfall_probability,

        riskScore: result.risk_score,

        riskScorePercent: Number(
          (result.risk_score * 100).toFixed(2)
        ),

        riskLevel: result.risk_level,

        modelVersion:
          model_version ||
          'static-rf-plus-rainfall-lr-v1',

        savedPrediction: savedPrediction
          ? {
              id: savedPrediction.id,
              locationId:
                savedPrediction.location_id,
              riskScore: Number(
                savedPrediction.risk_score
              ),
              riskLevel:
                savedPrediction.risk_level,
              predictedAt:
                savedPrediction.predicted_at,
            }
          : null,
      },
    });
  }
);

const predictLocationRisk = asyncHandler(
  async (req, res) => {
    const locationId = Number(
      req.params.locationId
    );

    if (!Number.isInteger(locationId)) {
      throw new ApiError(
        400,
        'Invalid location id. It must be a number.'
      );
    }

    const location =
      await locationsService.getLocationById(
        locationId
      );

    if (!location) {
      throw new ApiError(
        404,
        `No location found with id ${locationId}.`
      );
    }

    const locationInput = {
      locationId: location.id,
      state: location.state,
      district: location.district,
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
    };

    const result = await runLocationPrediction(
      locationInput
    );

    if (
      typeof result.susceptibility_probability !==
        'number' ||
      typeof result.rainfall_probability !==
        'number' ||
      typeof result.risk_score !== 'number' ||
      typeof result.risk_level !== 'string'
    ) {
      throw new ApiError(
        502,
        'ML prediction returned an invalid response.'
      );
    }

    const modelVersion =
      'static-rf-plus-rainfall-lr-v1';

    const savedPrediction =
      await savePrediction({
        locationId,
        result,
        modelVersion,
      });

    res.json({
      success: true,

      data: {
        location: {
          id: location.id,
          state: location.state,
          district: location.district,
          name: location.name,
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
        },

        prediction: {
          susceptibilityProbability:
            result.susceptibility_probability,

          rainfallProbability:
            result.rainfall_probability,

          riskScore: result.risk_score,

          riskScorePercent: Number(
            (result.risk_score * 100).toFixed(2)
          ),

          riskLevel: result.risk_level,

          modelVersion,
        },

        source: result.source || null,

        inputFeatures:
          result.input_features || null,

        savedPrediction: {
          id: savedPrediction.id,
          locationId:
            savedPrediction.location_id,
          riskScore: Number(
            savedPrediction.risk_score
          ),
          riskLevel:
            savedPrediction.risk_level,
          predictedAt:
            savedPrediction.predicted_at,
        },

        predictionType:
          'historical_event_snapshot',
      },
    });
  }
);

module.exports = {
  predictRisk,
  predictLocationRisk,
};